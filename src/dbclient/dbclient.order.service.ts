import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbClientService } from './dbclient.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DbClientOrderService {
  constructor(private readonly dbClientService: DbClientService) {}

  async createOrder(fromUserId: number, orderData: Prisma.OrderCreateInput) {
    try {
      return await this.dbClientService.order.create({
        data: {
          ...orderData,
          fromUser: {
            connect: { id: fromUserId },
          },
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      return this.orderDbErrorHandler(error);
    }
  }

  async getOrder(orderId: number) {
    try {
      const order = await this.dbClientService.order.findUnique({
        where: { id: orderId },
        include: {
          fromUser: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found!`);
      }

      return order;
    } catch (error) {
      return this.orderDbErrorHandler(error);
    }
  }

  async deleteOrder(orderId: number) {
    try {
      const deletedOrder = await this.dbClientService.order.delete({
        where: { id: orderId },
      });

      return deletedOrder;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Order with ID ${orderId} not found!`);
      }
      return this.orderDbErrorHandler(error);
    }
  }

  orderDbErrorHandler(error: Error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new HttpException(
        'Database error: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    throw new HttpException(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

// async function deleteUserWithOrders(userId: number) {
//   await prisma.$transaction([
//     prisma.order.deleteMany({ where: { fromUserId: userId } }),
//     prisma.user.delete({ where: { id: userId } }),
//   ]);
// }
