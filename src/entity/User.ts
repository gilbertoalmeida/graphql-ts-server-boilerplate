import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  BaseEntity
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

/* users is optional to rename the table of this entity in the database */
@Entity("users")
/* BaseEntity is from typeorm allows to use user.create(passing the values)*/
export class User extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("text")
  password: string;

  /* will run before the creation of the user, creating the uuid */
  @BeforeInsert()
  addId() {
    this.id = uuidv4();
  }
}
