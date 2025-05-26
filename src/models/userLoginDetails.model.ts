import { Model, DataTypes, Sequelize, Optional, Association } from 'sequelize';
import dotenv from 'dotenv';
import { User } from './user.model';

dotenv.config({ path: './.env' });

interface UserLoginDetailAttributes {
  id: number;
  user_id: number;
  token: string;
  user_key?: string;
  user_agent?: string;
  ip_address?: string;
  expires_at?: Date;
}

interface UserLoginDetailCreationAttributes
  extends Optional<UserLoginDetailAttributes, 'id'> { }

class UserLoginDetail
  extends Model<UserLoginDetailAttributes, UserLoginDetailCreationAttributes>
  implements UserLoginDetailAttributes {
  public id!: number;
  public user_id!: number;
  public token!: string;
  public user_key?: string;
  public user_agent?: string;
  public ip_address?: string;
  public expires_at?: Date;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;

  public static associations: {
    logged_user: Association<UserLoginDetail, User>;
  };

  public static associate(models: any): void {
    UserLoginDetail.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'logged_user',
    });
  }
}

export function initUserLoginDetailModel(sequelize: Sequelize) {
  UserLoginDetail.init(
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
      user_key: {
        allowNull: true,
        type: DataTypes.TEXT('medium')
      },
      token: {
        allowNull: false,
        type: DataTypes.TEXT('medium'),
      },
      user_agent: {
        allowNull: true,
        type: DataTypes.TEXT('medium'),
      },
      ip_address: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      expires_at: {
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: () => {
          const date = new Date();
          date.setHours(date.getHours() + 24); // Default 24 hours expiration
          return date;
        }
      },
    },
    {
      sequelize,
      tableName: 'user_login_details',
      modelName: 'UserLoginDetail',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      underscored: true,
      paranoid: true,
    }
  );

  return UserLoginDetail;
}

export default {
  UserLoginDetail,
  initUserLoginDetailModel,
};
