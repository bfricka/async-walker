# Async Walker

This is just a basic async walker that allows you to perform manipulation (read: filter, map) during a file walk. It's fully async and returns a [Q promise](https://github.com/kriskowal/q/).

***Note:***
If you're looking for something to do glob matching, this isn't the implementation you want. Check out [node-glob](https://github.com/isaacs/node-glob), which is a very comprehensive and solid implementation.