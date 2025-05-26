import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { User } from './user.model';
import { WalletTransaction } from './walletTransaction.model';
import { Game } from './game.model';

export interface BetAttributes {
    id: number;
    user_id: number;
    amount: number;
    bet_option: 'UP' | 'DOWN' | 'EXACT';
    status: 'PENDING' | 'WON' | 'LOST';
    payout: number;

}

export class Bet extends Model<BetAttributes> implements BetAttributes {
    public id!: number;
    public user_id!: number;
    public amount!: number;
    public bet_option!: 'UP' | 'DOWN' | 'EXACT';
    public status!: 'PENDING' | 'WON' | 'LOST';
    public payout!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static associations: {
        bet_user: Association<Bet, User>;
        bet_transactions: Association<Bet, WalletTransaction>;
        bet_game: Association<Bet, Game>;
    };

    public static associate(models: any): void {
        Bet.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'bet_user',
        });

        Bet.hasMany(models.WalletTransaction, {
            foreignKey: 'bet_id',
            as: 'bet_transactions',
        });

        Bet.hasOne(models.Game, {
            foreignKey: 'bet_id',
            as: 'bet_game',
        });
    }

}

export function initBetModel(sequelize: Sequelize) {
    Bet.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: {
                        args: [1.0],
                        msg: 'Minimum bet amount is 1.0'
                    },
                    isPositive(value: number) {
                        if (value <= 0) {
                            throw new Error('Bet amount must be positive');
                        }
                    }
                }
            },
            bet_option: {
                type: DataTypes.ENUM('UP', 'DOWN', 'EXACT'),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('PENDING', 'WON', 'LOST'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            payout: {
                type: DataTypes.FLOAT,
                allowNull: true,
                defaultValue: 0.0,
            }
        },
        {
            tableName: 'bets',
            modelName: 'Bet',
            timestamps: true,
            paranoid: true,
            deletedAt: 'deleted_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
            indexes: [
                {
                    name: 'bet_user_id_idx',
                    fields: ['user_id']
                },
                {
                    name: 'bet_status_idx',
                    fields: ['status']
                },
                {
                    name: 'bet_c_at_idx',
                    fields: ['created_at']
                }
            ],
            sequelize,
        }
    );


    return Bet;
}

export default { Bet, initBetModel };
