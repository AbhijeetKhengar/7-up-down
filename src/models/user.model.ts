import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { hashPassword } from 'crypt-vault';
import { Wallet } from './wallet.model';
import { Bet } from './bet.model';

export interface UserAttributes {
  id: number;
  email: string;
  password: string;

}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static associations: {
    user_wallet: Association<User, Wallet>;
    bets: Association<User, Bet>;
  };

  public static associate(models: any): void {
    User.hasOne(models.Wallet, {
      foreignKey: 'user_id',
      as: 'user_wallet',
    });

    User.hasMany(models.Bet, {
      foreignKey: 'user_id',
      as: 'bets',
    });
  }
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: 'users',
      modelName: 'User',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      sequelize,
    }
  );

  User.beforeSave((user) => {
    console.log(user, 'user');

    if (
      user.changed('password') &&
      user.password &&
      user.password?.trim() !== ''
    ) {
      user.password = hashPassword(user.password);
    }
  });

  return User;
}

export default { User, initUserModel };
