import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { Bet } from './bet.model';
import { WalletTransaction } from './walletTransaction.model';

export interface GameAttributes {
    id: number;
    bet_id: number;
    dice1: number;
    dice2: number;
    total: number;
    result: 'UP' | 'DOWN' | 'EXACT';

}

export class Game extends Model<GameAttributes> implements GameAttributes {
    public id!: number;
    public bet_id!: number;
    public dice1!: number;
    public dice2!: number;
    public total!: number;
    public result!: 'UP' | 'DOWN' | 'EXACT';

    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static associations: {
        game_bet: Association<Game, Bet>;
        game_transaction: Association<Game, WalletTransaction>;
    };

    public static associate(models: any): void {
        Game.belongsTo(models.Bet, {
            foreignKey: 'bet_id',
            as: 'game_bet',
        });

        Game.hasOne(models.WalletTransaction, {
            foreignKey: 'game_id',
            as: 'game_transaction',
        });
    }
}

export function initGameModel(sequelize: Sequelize) {
    Game.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            bet_id: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: 'bets',
                    key: 'id',
                },
                unique: true,
                validate: {
                    notNull: {
                        msg: 'Bet ID is required'
                    }
                }
            },
            dice1: {
                type: DataTypes.SMALLINT,
                allowNull: false,
            },
            dice2: {
                type: DataTypes.SMALLINT,
                allowNull: false,
            },
            total: {
                type: DataTypes.SMALLINT,
                allowNull: false,
            },
            result: {
                type: DataTypes.ENUM('UP', 'DOWN', 'EXACT'),
                allowNull: false,
            }
        },
        {
            tableName: 'games',
            modelName: 'Game',
            timestamps: true,
            paranoid: true,
            deletedAt: 'deleted_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
            indexes: [
                {
                    name: 'g_bet_id_idx',
                    fields: ['bet_id'],
                    unique: true
                },
                {
                    name: 'g_rlt_idx',
                    fields: ['result']
                },
                {
                    name: 'g_c_at_idx',
                    fields: ['created_at']
                }
            ],
            sequelize,
        }
    );

    return Game;
}

export default { Game, initGameModel };
