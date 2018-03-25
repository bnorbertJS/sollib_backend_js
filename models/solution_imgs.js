import bookshelf from '../bookshelf';
import Solution from './solution';

export default bookshelf.Model.extend({
    tableName: 'solution_imgs',
    solution: function() {
        return this.belongsTo(Solution);
    }
})