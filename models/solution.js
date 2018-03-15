import bookshelf from '../server/bookshelf';
import User from './user';

export default bookshelf.Model.extend({
    tableName: 'solutions',
    user: function() {
        return this.belongsTo(User);
    }
})