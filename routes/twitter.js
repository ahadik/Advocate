var TWITTER_CONSUMER_KEY = "3F105wXBl8Hfmywi1s4vc557C";
var TWITTER_CONSUMER_SECRET = "ndqHBZL5TYz6bRcv00Lf9wxdh4IFR6TXSYnLYR004zSwDE0MWp";

exports.twitter = function(passport, TwitterStrategy){

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});
	
	passport.deserializeUser(function(obj, done) {
	  done(null, obj);
	});
	
	passport.use(new TwitterStrategy({
	    consumerKey: TWITTER_CONSUMER_KEY,
	    consumerSecret: TWITTER_CONSUMER_SECRET,
	    callbackURL: process.env.INSTANCE_HOST+"/auth/twitter/callback"
	  },
	  function(token, tokenSecret, profile, done) {
	    // asynchronous verification, for effect...
	    process.nextTick(function () {
	
	      // To keep the example simple, the user's Twitter profile is returned to
	      // represent the logged-in user.  In a typical application, you would want
	      // to associate the Twitter account with a user record in your database,
	      // and return that user instead.
	      return done(null, profile);
	    });
	  }
	));
}
