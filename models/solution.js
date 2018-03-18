import bookshelf from '../bookshelf';
import User from './user';

export default bookshelf.Model.extend({
    tableName: 'solutions',
    user: function() {
        return this.belongsTo(User);
    }
})