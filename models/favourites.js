import bookshelf from '../bookshelf';
import User from './user';

export default bookshelf.Model.extend({
    tableName: 'favourites',
    favourites: function() {
        return this.belongsTo(User);
    }
})