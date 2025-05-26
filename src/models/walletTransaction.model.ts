import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { Wallet } from './wallet.model';
import { Bet } from './bet.model';
import { Game } from './game.model';

export interface WalletTransactionAttributes {
    id: number;
    wallet_id: number;
    type: 'CREDIT' | 'DEBIT'
    amount: number;
    reason: 'PLACE_BET' | 'BET_WIN' | 'BONUS';
    game_id?: number;
    bet_id?: number;
    prev_balance: number;
    new_balance: number;
}

export class WalletTransaction extends Model<WalletTransactionAttributes> implements WalletTransactionAttributes {
    public id!: number;
    public wallet_id!: number;
    public type!: 'CREDIT' | 'DEBIT';
    public amount!: number;
    public reason!: 'PLACE_BET' | 'BET_WIN' | 'BONUS';
    public game_id?: number;
    public bet_id?: number;
    public prev_balance!: number;
    public new_balance!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static associations: {
        wallet: Association<WalletTransaction, Wallet>;
        bet: Association<WalletTransaction, Bet>;
        game: Association<WalletTransaction, Game>;
    };

    public static associate(models: any): void {
        WalletTransaction.belongsTo(models.Wallet, {
            foreignKey: 'wallet_id',
            as: 'wallet',
        });
        
        WalletTransaction.belongsTo(models.Bet, {
            foreignKey: 'bet_id',
            as: 'bet',
        });
        
        WalletTransaction.belongsTo(models.Game, {
            foreignKey: 'game_id',
            as: 'game',
        });
    }

}

export function initWalletTransactionModel(sequelize: Sequelize) {
    WalletTransaction.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            wallet_id: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: 'wallets',
                    key: 'id',
                },
            },
            type: {
                type: DataTypes.ENUM('CREDIT', 'DEBIT'),
                allowNull: false,
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            reason: {
                type: DataTypes.ENUM(
                    'PLACE_BET',
                    'BET_WIN',
                    'BONUS',
                ),
                allowNull: false,
                defaultValue: 'BONUS',
            },
            game_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'games',
                    key: 'id',
                },
            },
            bet_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'bets',
                    key: 'id',
                },
            },
            prev_balance: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            new_balance: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            }
        },
        {
            tableName: 'wallet_transactions',
            modelName: 'WalletTransaction',
            timestamps: true,
            paranoid: true,
            deletedAt: 'deleted_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
            indexes: [
                {
                    name: 'wtx_wallet_id_idx',
                    fields: ['wallet_id']
                },
                {
                    name: 'wtx_bet_id_idx',
                    fields: ['bet_id']
                },
                {
                    name: 'wtx_game_id_idx',
                    fields: ['game_id']
                },
                {
                    name: 'wtx_type_idx',
                    fields: ['type']
                },
                {
                    name: 'wtx_created_at_idx',
                    fields: ['created_at']
                }
            ],
            sequelize,
        }
    );

    return WalletTransaction;
}

export default { WalletTransaction, initWalletTransactionModel };
