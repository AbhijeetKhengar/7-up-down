import { Request, Response, NextFunction } from 'express';
import { db } from '../../models';
import { sequelize } from '../../config/sequelize';
import SendResponse from '../../helpers/send-response.helper';
import { ErrorType } from '../../utils/error-types.utils';
import AppError from '../../utils/error-helper.utils';
import { localizationService } from '../../services/localization.service';

export class BetController {
  async placeBet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Get authenticated user
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          localizationService.translations.auth.unauthorized,
          ErrorType.unauthorized
        );
      }

      // Extract bet details from request body
      const { amount, bet_option } = req.body.data || req.body;

      // Convert amount to number to ensure proper calculation
      const betAmount = Number(amount);

      // Find user's wallet
      const wallet = await db.Wallet.findOne({
        where: { user_id: userId },
        transaction
      });

      if (!wallet) {
        throw new AppError(
          localizationService.translations.wallet.notFound,
          ErrorType.not_found
        );
      }

      // Check if user has sufficient balance
      if (wallet.balance < betAmount) {
        throw new AppError(
          localizationService.translations.wallet.insufficientBalance,
          ErrorType.invalid_request
        );
      }

      // Calculate new balance
      const prevBalance = Number(wallet.balance);
      const newBalance = prevBalance - betAmount;

      // Update wallet balance
      await wallet.update({
        balance: newBalance
      }, { transaction });

      // Create new bet record
      const bet = await db.Bet.create({
        user_id: userId,
        amount: betAmount,
        bet_option,
        status: 'PENDING',
        payout: 0 // Will be updated when the bet is resolved
      }, { transaction });

      // Create wallet transaction record for the bet
      await db.WalletTransaction.create({
        wallet_id: wallet.id,
        type: 'DEBIT',
        amount: betAmount,
        reason: 'PLACE_BET',
        bet_id: bet.id,
        prev_balance: prevBalance,
        new_balance: newBalance
      }, { transaction });

      // Commit the transaction
      await transaction.commit();

      // Fetch the created bet with user details
      const betWithDetails = await db.Bet.findOne({
        where: { id: bet.id },
        include: [
          {
            model: db.User,
            as: 'bet_user',
            attributes: ['id', 'email']
          }
        ]
      });

      // Prepare response
      return new SendResponse({
        code: 201,
        status: 'success',
        message: localizationService.translations.bet.placedSuccess,
        data: {
          bet: betWithDetails,
          wallet: {
            previous_balance: prevBalance,
            current_balance: newBalance
          }
        },
      }).send(res);
    } catch (error) {
      // Rollback transaction in case of error
      if (transaction) await transaction.rollback();
      console.error('Error placing bet:', error);
      next(error);
    }
  }

  async rollDice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Get authenticated user
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          localizationService.translations.auth.unauthorized,
          ErrorType.unauthorized
        );
      }

      // Extract bet ID from request body
      const { bet_id } = req.body.data || req.body;

      // Find the bet
      const bet = await db.Bet.findOne({
        where: { id: bet_id },
        transaction
      });

      if (!bet) {
        throw new AppError(
          localizationService.translations.bet.notFound,
          ErrorType.not_found
        );
      }

      // Check if bet belongs to the authenticated user
      if (bet.user_id !== userId) {
        throw new AppError(
          localizationService.translations.bet.notOwnBet,
          ErrorType.Forbidden
        );
      }

      // Check if bet is still pending
      if (bet.status !== 'PENDING') {
        throw new AppError(
          localizationService.translations.bet.alreadyResolved,
          ErrorType.invalid_request
        );
      }

      // Check if a game already exists for this bet
      const existingGame = await db.Game.findOne({
        where: { bet_id: bet_id },
        transaction
      });

      if (existingGame) {
        throw new AppError(
          localizationService.translations.bet.diceAlreadyRolled,
          ErrorType.invalid_request
        );
      }

      // Roll the dice
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;

      // Determine the result
      let result: 'UP' | 'DOWN' | 'EXACT';
      if (total > 7) {
        result = 'UP';
      } else if (total < 7) {
        result = 'DOWN';
      } else {
        result = 'EXACT';
      }

      // Determine if the bet is won or lost
      let betStatus: 'WON' | 'LOST';
      let payout = 0;

      if (bet.bet_option === result) {
        betStatus = 'WON';
        // Calculate payout: 2x for UP/DOWN, 4x for EXACT
        const multiplier = bet.bet_option === 'EXACT' ? 4 : 2;
        payout = Number(bet.amount) * multiplier;
      } else {
        betStatus = 'LOST';
        payout = 0;
      }

      // Create game record
      const game = await db.Game.create({
        bet_id: bet.id,
        dice1,
        dice2,
        total,
        result
      }, { transaction });

      // Update bet status and payout
      await bet.update({
        status: betStatus,
        payout
      }, { transaction });

      // If the bet is won, update wallet balance
      if (betStatus === 'WON') {
        // Find user's wallet
        const wallet = await db.Wallet.findOne({
          where: { user_id: userId },
          transaction
        });

        if (!wallet) {
          throw new AppError(
            localizationService.translations.wallet.notFound,
            ErrorType.not_found
          );
        }

        // Calculate new balance
        const prevBalance = Number(wallet.balance);
        const newBalance = prevBalance + payout;

        // Update wallet balance
        await wallet.update({
          balance: newBalance
        }, { transaction });

        // Create wallet transaction record for the win
        await db.WalletTransaction.create({
          wallet_id: wallet.id,
          type: 'CREDIT',
          amount: payout,
          reason: 'BET_WIN',
          bet_id: bet.id,
          game_id: game.id,
          prev_balance: prevBalance,
          new_balance: newBalance
        }, { transaction });
      }

      // Commit the transaction
      await transaction.commit();

      // Fetch the updated bet with game details
      const betWithDetails = await db.Bet.findOne({
        where: { id: bet.id },
        include: [
          {
            model: db.Game,
            as: 'bet_game',
            attributes: ['id', 'dice1', 'dice2', 'total', 'result', 'created_at']
          },
          {
            model: db.User,
            as: 'bet_user',
            attributes: ['id', 'email']
          }
        ]
      });

      // Get updated wallet balance
      const updatedWallet = await db.Wallet.findOne({
        where: { user_id: userId }
      });

      // Prepare response
      return new SendResponse({
        code: 200,
        status: 'success',
        message: betStatus === 'WON'
          ? localizationService.translations.bet.wonMessage.replace('{amount}', payout.toString())
          : localizationService.translations.bet.lostMessage,
        data: {
          bet: betWithDetails,
          game: {
            dice1,
            dice2,
            total,
            result
          },
          outcome: {
            status: betStatus,
            payout
          },
          wallet: {
            balance: updatedWallet.balance
          }
        },
      }).send(res);
    } catch (error) {
      // Rollback transaction in case of error
      if (transaction) await transaction.rollback();
      console.error('Error rolling dice:', error);
      next(error);
    }
  }
}

export default BetController;
