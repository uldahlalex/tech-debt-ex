using Infra;
using LinqToDB;
using LinqToDB.Data;

public class MyDatabaseConnection : DataConnection
{
    public MyDatabaseConnection(DataOptions<MyDatabaseConnection> options) : base(options.Options)
    {
    }

    public ITable<Recipe> Recipes => this.GetTable<Recipe>();
    public ITable<Chef> Chefs => this.GetTable<Chef>();
}
