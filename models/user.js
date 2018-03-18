import bookshelf from '../bookshelf';
import Solution from './solution';

export default bookshelf.Model.extend({
    tableName: 'users',
    solutions: function() {
        return this.hasMany(Solution);
    }
})