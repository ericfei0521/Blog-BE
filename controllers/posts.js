exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{ title: 'firstPost', content: 'test post', imageUrl: 'images/tree.jpg' }],
    });
};
exports.createPost = (req, res, next) => {
    const { title, content } = req.body;
    //update to db
    res.status(201).json({
        message: 'create success',
        post: {
            id: new Date().toISOString(),
            title: title,
            content: content,
        },
    });
};
