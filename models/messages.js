import bookshelf from '../bookshelf';
import User from './user';

export default bookshelf.Model.extend({
    tableName: 'messages',
    user: function(){
        return this.belongsTo(User);
    },
    messages: function() {
        return this.belongsTo(User);
    }
})