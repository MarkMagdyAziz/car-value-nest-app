import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { GetEstimateReportDto } from './dto/estimate-report.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(report: CreateReportDto, user: User) {
    const newReport = this.repo.create(report);
    newReport.user = user;
    return this.repo.save(newReport);
  }

  // this is a synchronous operation. You have the actual entity.
  // You can perform business logic before saving.
  // Entity hooks/listeners may be triggered depending on your TypeORM setup.
  // You can validate/check other properties.
  // You get the saved entity back.
  // Useful when you need relationships or other existing fields.

  // Disadvantage: You have to make an extra query to fetch the entity first, which can be less efficient if you don't need the entity for other purposes.
  //   async changeApprovalStatus(id: number, approved: boolean) {
  //     const report = await this.repo.findOneBy({ id });

  //     if (!report) {
  //       throw new NotFoundException('report not found');
  //     }

  //     report.approved = approved;
  //     return this.repo.save(report);
  //   }

  //   This goes directly to, no fetching the entity first. You just update the field you want to change. This is more efficient if you don't need the entity for other purposes.
  //  If your API needs to return the updated report this is not the best approach because you don't have the updated entity to return. You would need to fetch it again after the update if you want to return it.
  async changeApprovalStatus(id: number, approved: boolean) {
    const result = await this.repo.update(id, { approved });

    if (result.affected === 0) {
      throw new NotFoundException('Report not found');
    }

    return result;
  }

  createEstimate({
    make,
    model,
    lng,
    lat,
    year,
    mileage,
  }: GetEstimateReportDto) {
    return this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
