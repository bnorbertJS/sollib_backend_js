import bookshelf from '../bookshelf';
import Solution from './solution';
import Skill from './skills';
import Favourite from './favourites';

export default bookshelf.Model.extend({
    tableName: 'users',
    solutions: function() {
        return this.hasMany(Solution);
    },
    skills: function(){
        return this.hasMany(Skill);
    },
    favourites: function(){
        return this.hasMany(Favourite);
    }
})