import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { User } from './user.model';
import { WalletTransaction } from './walletTransaction.model';

export interface WalletAttributes {
    id: number;
    user_id: number;
    balance: number;

}

export class Wallet extends Model<WalletAttributes> implements WalletAttributes {
    public id!: number;
    public user_id!: number;
    public balance!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static associations: {
        wallet_user: Association<Wallet, User>;
        transactions: Association<Wallet, WalletTransaction>;
    };

    public static associate(models: any): void {
        Wallet.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'wallet_user',
        });

        Wallet.hasMany(models.WalletTransaction, {
            foreignKey: 'wallet_id',
            as: 'transactions',
        });
    }
}

export function initWalletModel(sequelize: Sequelize) {
    Wallet.init(
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
            balance: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: {
                        args: [0.0],
                        msg: 'Balance cannot be negative'
                    }
                }
            },
        },
        {
            tableName: 'wallets',
            modelName: 'Wallet',
            timestamps: true,
            paranoid: true,
            deletedAt: 'deleted_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
            indexes: [
                {
                    name: 'wlx_u_id_idx',
                    fields: ['user_id'],
                    unique: true
                }
            ],
            sequelize,
        }
    );

    return Wallet;
}

export default { Wallet, initWalletModel };
