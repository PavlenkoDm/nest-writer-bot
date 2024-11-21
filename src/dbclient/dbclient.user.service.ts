import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbClientService } from './dbclient.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DbClientUserService {
  constructor(private readonly dbClientService: DbClientService) {}

  async createUser(userData: Prisma.UserCreateInput) {
    const newUser = await this.dbClientService.user.create({
      data: {
        ...userData,
      },
      select: {
        id: true,
        userTelegramId: true,
      },
    });
    return newUser;
  }

  async getUser(userId: number) {
    try {
      const user = await this.dbClientService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found!`);
      }

      return user;
    } catch (error) {
      return this.userDbErrorHandler(error);
    }
  }

  async getUserByTelegramId(userTelegramId: number) {
    try {
      const user = await this.dbClientService.user.findUnique({
        where: { userTelegramId },
      });

      return user;
    } catch (error) {
      return this.userDbErrorHandler(error);
    }
  }

  async deleteOrder(userId: number) {
    try {
      const deletedUser = await this.dbClientService.user.delete({
        where: { id: userId },
      });
      return deletedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${userId} not found!`);
      }
      return this.userDbErrorHandler(error);
    }
  }

  private userDbErrorHandler(error: Error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new HttpException(
        'Database error: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    throw new HttpException(
      'An unexpected error occurred: ' + error.message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
