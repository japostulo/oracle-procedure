import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";

export class UppercaseNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(targetName: string, userSpecifiedName: string): string {
    return userSpecifiedName
      ? userSpecifiedName.toUpperCase()
      : targetName.toUpperCase();
  }

  columnName(propertyName: string, customName: string): string {
    return customName ? customName.toUpperCase() : propertyName.toUpperCase();
  }
}
