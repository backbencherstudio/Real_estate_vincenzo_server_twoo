import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;

    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (filed) =>
            ({
              [filed]: { $regex: searchTerm, $options: 'i' },
            }) as unknown as FilterQuery<T>[],
        ),
      });
    }
    return this;
  }

  // filter() {
  //   const queryObj = { ...this.query };     
  //   const excluedeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  //   excluedeFields.forEach((el) => delete queryObj[el]); 
  //   this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
  //   return this;
  // }

  filter() {
    const queryObj = { ...this.query }; 
    const excluedeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    excluedeFields.forEach((el) => delete queryObj[el]);
    if (queryObj.role && queryObj.role !== 'all') {
        this.modelQuery = this.modelQuery.find({ role: queryObj.role } as FilterQuery<T>);
    } else {
        this.modelQuery = this.modelQuery.find();
    }
    return this;
}


  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);
    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    // (getFilter) এর সাহায্যে আমরা সকল প্রকার query পাউয়া যাবে(vdo:6.10 M20.11)
    const TotalQuery = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(TotalQuery);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPage,
    };
  }
}

export default QueryBuilder;
