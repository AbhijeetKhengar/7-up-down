import { Request, Response, NextFunction } from 'express';
import { db } from '../../models';
import { sequelize } from '../../config/sequelize'
import SendResponse from '../../helpers/send-response.helper';
import { generateString } from '../../helpers/random.helper';
import { ErrorType } from '../../utils/error-types.utils'
import {
  comparePassword,
  encrypt,
  uuidv4,
} from 'crypt-vault';
import AppError from '../../utils/error-helper.utils';
import { localizationService } from '../../services/localization.service';

export class UserController {
  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Extract login credentials from request body
      const { email, password } = req.body.data || req.body;

      // Find user by email
      let user = await db.User.findOne({
        where: { email },
        attributes: ['id', 'password', 'email'],
        transaction
      });

      // If user doesn't exist, create a new one
      if (!user) {
        // Create a new user with the provided email and password
        user = await db.User.create({
          email,
          password, // Password will be hashed by the beforeSave hook
        }, { transaction });

        // Log user creation
        console.log(`New user created with email: ${email}`);
      } else {
        // If user exists, validate password
        const isPasswordValid = comparePassword(user.password, password);

        if (!isPasswordValid) {
          await transaction.rollback();
          throw new AppError(
            localizationService.translations.user.invalidPassword,
            ErrorType.invalid_request
          );
        }
      }

      // Find or create wallet for the user
      const [wallet, walletCreated] = await db.Wallet.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          balance: 500 // Initial balance for new wallets
        },
        transaction
      });

      // Add bonus of 500 coins on every login
      if (!walletCreated) {
        // Get current balance
        const prevBalance = wallet.balance;

        // Update wallet with additional 500 coins
        await wallet.update({
          balance: Number(prevBalance) + (500)
        }, { transaction });

        // Add transaction record for the bonus
        await db.WalletTransaction.create({
          wallet_id: wallet.id,
          type: 'CREDIT',
          amount: 500,
          reason: 'BONUS',
          prev_balance: prevBalance,
          new_balance: prevBalance + 500
        }, { transaction });
      } else {
        // For newly created wallets, add the initial transaction record
        await db.WalletTransaction.create({
          wallet_id: wallet.id,
          type: 'CREDIT',
          amount: 500,
          reason: 'BONUS',
          prev_balance: 0,
          new_balance: 500
        }, { transaction });
      }

      // Generate login details
      const loginId = uuidv4();
      const key = generateString(32);

      // Create token payload
      const tokenPayload = {
        user_id: user.id,
        loginId,
        key,
        timestamp: new Date().getTime()
      };

      // Encrypt token
      const encryptedToken = encrypt(tokenPayload);

      // Calculate expiration date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Get client information
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress =
        req.headers['x-forwarded-for'] as string ||
        req.socket.remoteAddress ||
        '';

      // Create login record
      await db.UserLoginDetail.create({
        token: encryptedToken,
        user_key: key,
        user_id: user.id,
        user_agent: userAgent,
        ip_address: ipAddress,
        expires_at: expiresAt
      }, { transaction });

      // Commit the transaction
      await transaction.commit();

      // Prepare user response (exclude password)
      const userResponse = user.toJSON();
      delete userResponse.password;

      // Get updated wallet balance
      const updatedWallet = await db.Wallet.findOne({
        where: { user_id: user.id }
      });

      // Send successful response
      return new SendResponse({
        code: 200,
        status: 'success',
        message: localizationService.translations.user.loginSuccess,
        data: {
          ...userResponse,
          wallet: {
            balance: updatedWallet.balance
          },
          token: encryptedToken,
          key,
          expires_at: expiresAt
        },
      }).send(res);
    } catch (error) {
      // Rollback transaction in case of error
      if (transaction) await transaction.rollback();
      console.error('Login error:', error);
      next(error);
    }
  }
  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      let userId: number | undefined;

      // Check if an ID is provided in the params
      if (req.params.id) {
        userId = parseInt(req.params.id);

        // Validate that the ID is a valid number
        if (isNaN(userId)) {
          throw new AppError(
            localizationService.translations.user.invalidIdFormat,
            ErrorType.invalid_request
          );
        }
      } else {
        // If no ID provided, use the authenticated user's ID
        if (!req.user || !req.user.id) {
          throw new AppError(
            localizationService.translations.auth.unauthorized,
            ErrorType.unauthorized
          );
        }

        userId = req.user.id;
      }

      // Fetch the user profile with related data
      const user = await db.User.findOne({
        where: { id: userId },
        attributes: ['id', 'email', 'created_at', 'updated_at'],
        include: [
          {
            model: db.Wallet,
            as: 'user_wallet',
            attributes: ['id', 'balance', 'created_at', 'updated_at'],
          }
        ]
      });

      if (!user) {
        throw new AppError(
          localizationService.translations.user.notExist,
          ErrorType.not_found
        );
      }

      // Get all bets for statistics calculation
      const bets = await db.Bet.findAll({
        where: { user_id: userId },
        include: [
          {
            model: db.Game,
            as: 'bet_game',
            attributes: ['id', 'dice1', 'dice2', 'total', 'result', 'created_at'],
          }
        ]
      });

      // Get recent bets (limit to 10)
      const recentBets = await db.Bet.findAll({
        where: { user_id: userId },
        include: [
          {
            model: db.Game,
            as: 'bet_game',
            attributes: ['id', 'dice1', 'dice2', 'total', 'result', 'created_at'],
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      });

      // Get recent wallet transactions
      const recentTransactions = await db.WalletTransaction.findAll({
        where: {
          wallet_id: user.user_wallet?.id
        },
        attributes: ['id', 'type', 'amount', 'reason', 'prev_balance', 'new_balance', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 10
      });

      // Calculate basic statistics
      const totalBets = bets.length;
      const completedBets = bets.filter((bet: any) => bet.status !== 'PENDING').length;
      const wonBets = bets.filter((bet: any) => bet.status === 'WON').length;
      const lostBets = bets.filter((bet: any) => bet.status === 'LOST').length;
      const pendingBets = bets.filter((bet: any) => bet.status === 'PENDING').length;

      const totalWagered = bets.reduce((sum: any, bet: any) => sum + Number(bet.amount), 0);
      const totalWon = bets.filter((bet: any) => bet.status === 'WON')
        .reduce((sum: any, bet: any) => sum + Number(bet.payout), 0);
      const netProfit = totalWon - totalWagered;

      // Calculate win rate
      const winRate = completedBets > 0 ? (wonBets / completedBets) * 100 : 0;

      // Calculate bet option statistics
      const upBets = bets.filter((bet: any) => bet.bet_option === 'UP').length;
      const downBets = bets.filter((bet: any) => bet.bet_option === 'DOWN').length;
      const exactBets = bets.filter((bet: any) => bet.bet_option === 'EXACT').length;

      // Calculate win rates by bet option
      const upWins = bets.filter((bet: any) => bet.bet_option === 'UP' && bet.status === 'WON').length;
      const downWins = bets.filter((bet: any) => bet.bet_option === 'DOWN' && bet.status === 'WON').length;
      const exactWins = bets.filter((bet: any) => bet.bet_option === 'EXACT' && bet.status === 'WON').length;

      const upWinRate = upBets > 0 ? (upWins / upBets) * 100 : 0;
      const downWinRate = downBets > 0 ? (downWins / downBets) * 100 : 0;
      const exactWinRate = exactBets > 0 ? (exactWins / exactBets) * 100 : 0;

      // Calculate dice statistics
      const games = bets.map((bet: any) => bet.bet_game).filter((game: any) => game !== null);

      const diceFrequency = {
        dice1: Array(6).fill(0),
        dice2: Array(6).fill(0),
        total: Array(11).fill(0) // Totals from 2 to 12
      };

      games.forEach((game: any) => {
        if (game) {
          // Dice 1 frequency (0-indexed array)
          diceFrequency.dice1[game.dice1 - 1]++;

          // Dice 2 frequency (0-indexed array)
          diceFrequency.dice2[game.dice2 - 1]++;

          // Total frequency (0-indexed array, but totals are 2-12)
          diceFrequency.total[game.total - 2]++;
        }
      });

      // Calculate most common dice results
      const mostCommonDice1 = diceFrequency.dice1.indexOf(Math.max(...diceFrequency.dice1)) + 1;
      const mostCommonDice2 = diceFrequency.dice2.indexOf(Math.max(...diceFrequency.dice2)) + 1;
      const mostCommonTotal = diceFrequency.total.indexOf(Math.max(...diceFrequency.total)) + 2;

      // Calculate streak information
      let currentStreak = 0;
      let longestWinStreak = 0;
      let longestLoseStreak = 0;

      // Sort bets by creation date (oldest first) for streak calculation
      const sortedBets = [...bets].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      let currentWinStreak = 0;
      let currentLoseStreak = 0;

      sortedBets.forEach(bet => {
        if (bet.status === 'WON') {
          currentWinStreak++;
          currentLoseStreak = 0;
          if (currentWinStreak > longestWinStreak) {
            longestWinStreak = currentWinStreak;
          }
        } else if (bet.status === 'LOST') {
          currentLoseStreak++;
          currentWinStreak = 0;
          if (currentLoseStreak > longestLoseStreak) {
            longestLoseStreak = currentLoseStreak;
          }
        }
      });

      // Determine current streak (positive for wins, negative for losses)
      for (let i = sortedBets.length - 1; i >= 0; i--) {
        if (sortedBets[i].status === 'PENDING') continue;

        if (sortedBets[i].status === 'WON') {
          if (currentStreak >= 0) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
          break;
        } else {
          if (currentStreak <= 0) {
            currentStreak--;
          } else {
            currentStreak = -1;
          }
          break;
        }
      }

      // Calculate average bet amount
      const averageBetAmount = totalBets > 0 ? totalWagered / totalBets : 0;

      // Calculate average payout for won bets
      const averagePayout = wonBets > 0
        ? bets.filter((bet: any) => bet.status === 'WON')
          .reduce((sum: any, bet: any) => sum + Number(bet.payout), 0) / wonBets
        : 0;

      // Calculate return on investment (ROI)
      const roi = totalWagered > 0 ? (netProfit / totalWagered) * 100 : 0;

      // Prepare comprehensive statistics
      const gameStats = {
        overview: {
          totalBets,
          completedBets,
          wonBets,
          lostBets,
          pendingBets,
          winRate: parseFloat(winRate.toFixed(2)),
          totalWagered: parseFloat(totalWagered.toFixed(2)),
          totalWon: parseFloat(totalWon.toFixed(2)),
          netProfit: parseFloat(netProfit.toFixed(2)),
          roi: parseFloat(roi.toFixed(2))
        },
        betOptions: {
          up: {
            total: upBets,
            won: upWins,
            winRate: parseFloat(upWinRate.toFixed(2))
          },
          down: {
            total: downBets,
            won: downWins,
            winRate: parseFloat(downWinRate.toFixed(2))
          },
          exact: {
            total: exactBets,
            won: exactWins,
            winRate: parseFloat(exactWinRate.toFixed(2))
          }
        },
        diceStats: {
          mostCommon: {
            dice1: mostCommonDice1,
            dice2: mostCommonDice2,
            total: mostCommonTotal
          },
          frequency: {
            dice1: diceFrequency.dice1,
            dice2: diceFrequency.dice2,
            total: diceFrequency.total
          }
        },
        streaks: {
          current: currentStreak,
          longestWin: longestWinStreak,
          longestLose: longestLoseStreak
        },
        averages: {
          betAmount: parseFloat(averageBetAmount.toFixed(2)),
          payout: parseFloat(averagePayout.toFixed(2))
        }
      };

      // Prepare the response
      const userProfile = {
        ...user.toJSON(),
        gameStats,
        recentActivity: {
          bets: recentBets,
          transactions: recentTransactions
        }
      };

      return new SendResponse({
        code: 200,
        status: 'success',
        message: localizationService.translations.user.profileFetched,
        data: userProfile,
      }).send(res);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      next(error);
    }
  }


}

export default UserController;
