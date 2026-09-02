import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { FindOperator, ILike, In, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserSearchQueries {
  id?: number;
  email?: string;
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    const id = Math.floor(Math.random() * 999999);

    // This is a synchronous operation. It does not touch the database.
    // It simply creates a new instance of your User entity in memory using the data from your DTO.
    const user = this.repo.create({ ...createUserDto, id });

    // This is asynchronous and actually communicates with the database.
    // It checks If the entity passed to it doesn't have an ID, it performs an INSERT. If it does have an ID, it performs an UPDATE.
    // In this case, since we generated a random ID, it will perform an INSERT.
    // it not only saves the user to the database but also returns the saved entity, which includes any default values, generated columns, and the ID that was assigned to it.
    const savedUser = await this.repo.save(user);
    console.log('savedUser', savedUser);
    return savedUser;
  }
  findAll() {
    // find(): Always returns an` array, even if it only finds one result.
    return this.repo.find();
  }

  async findOneById(id: number) {
    // Returns a single object or null.
    // It is the most efficient way to fetch a single record when you only have simple criteria.
    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findByEmail(email: string) {
    // Returns an array, even if it only finds one result.
    return this.repo.find({ where: { email } });
  }
  findSearch(args: UserSearchQueries) {
    // ILike: Stands for "In-sensitive Like." It allows for case-insensitive searching (e.g., searching for "mark" will find "Mark" or "MARK").
    // %${value}%: These wildcards mean "contains." It searches for the string anywhere inside the column.

    // Always returns an array, even if it only finds one result.
    const where: { [key: string]: FindOperator<string> | number } = {};
    if (args?.email) where.email = ILike(`%${args.email}%`);
    if (args?.name) where.name = ILike(`%${args.name}%`);
    if (args?.id) where.id = args.id;

    return this.repo.find({ where });
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);

    return this.repo.save(user);
  }

  async remove(ids: number | number[]) {
    // 1. Normalize the input into an array regardless of what was sent
    const idList = Array.isArray(ids) ? ids : [ids];

    // 2. Find all matching instances using the In operator
    // In(idList) converts the JavaScript array into a SQL WHERE id IN (1, 2, 3) clause.
    // This allows the database to find all matching rows in a single efficient trip.
    const users = await this.repo.find({
      where: { id: In(idList) },
    });

    // 3. Optional: Check if we found as many as we expected
    if (users.length === 0) {
      throw new NotFoundException('No users found with the provided ID(s)');
    }

    // 4. remove() handles an array of entities perfectly
    // Requires a full Entity Instance (which is why we fetch the users first).
    // Lifecycle: It triggers Entity Hooks (like @BeforeRemove or @AfterRemove).
    return this.repo.remove(users);
  }

  //NOTE - DELETE is better performance and one trip to the database, but it doesn't trigger entity lifecycle events.
  // If you need those, you can use softDelete() instead, which marks records as deleted without actually removing them from the database.
  delete(id: number) {
    // Only needs the ID (or a set of criteria).
    // Lifecycle: It is a raw SQL DELETE command. It does NOT trigger hooks.
    // Best for performance or bulk deletions where no extra logic is required.
    return this.repo.delete({ id });
  }
}
