class APIFeatures{
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1) FILTERING
        const queryObj = {...this.queryString}; //using destructuring we'd create a new object out of it.. the 3 dots will take the fields out of the object and we create a new object
        const excludedFields =['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el])
        // console.log(req.query, queryObj, );
        // console.log(`check this ${excludeFields}`)
        
        //ADVANCED FILTERING
        let queryStr = JSON.stringify(queryObj)
        //using regular expression to match any of the 4 words to query (lt=less than lte = less than or equal to) and adding the ($) opeerator to it
       queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        //console.log("here from advance filtering",JSON.parse(queryStr))
        
        this.query = this.query.find(JSON.parse(queryStr))
        return this
    } 
    sort() {
  //2) SORTING
       // /* just for sorting with price alone
        // if(req.query.sort) {
        //     query = query.sort(req.query.sort);
        // }
       //   */
       if(this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ')
        this.query = this.query.sort(sortBy);
    } else {
        this.query = this.query.sort('-createdAt');
    }
    return this;
    }
    limitFields() {
        //LIMITING FIELDS to only fields the user wants in the query
      
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    paginate() {
  //PAGINATION 
        /* setting 10 reults per page if the user dosen't specify the page neededby
        default our code would send to results per page and if the user identifies the
        page so we calculate and release the result */
        const page = this.queryString.page * 1 || 1; //page 1 by default
        const limit = this.queryString.limit * 1 || 100; //by default of 100 if the user does not specify limit
        const skip = (page - 1) * limit;
//page=3&limit=10, i.e 1-10 is page 1,  11-20 is page 2, 21-30 is page 3 etc...
        this.query = this.query.skip(skip).limit(limit);
    return this;
    }
}

module.exports = APIFeatures;