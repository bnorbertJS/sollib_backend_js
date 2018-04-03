import bookshelf from '../bookshelf';
import User from './user';

export default bookshelf.Model.extend({
    tableName: 'messages',
    messages: function() {
        return this.belongsTo(User);
    }
})