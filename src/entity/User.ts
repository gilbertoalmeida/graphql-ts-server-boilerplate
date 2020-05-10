import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  BeforeInsert
} from "typeorm";
import * as bcrypt from "bcryptjs";

/* users is optional to rename the table of this entity in the database */
@Entity("users")
/* BaseEntity is from typeorm allows to use user.create(passing the values)*/
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("text")
  password: string;

  @Column("boolean", { default: false })
  confirmed: boolean;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
