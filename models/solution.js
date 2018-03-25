import bookshelf from '../bookshelf';
import User from './user';
import SolutionImages from './solution_imgs';

export default bookshelf.Model.extend({
    tableName: 'solutions',
    user: function() {
        return this.belongsTo(User);
    },
    solution_imgs: function(){
        return this.hasMany(SolutionImages);
    }
})