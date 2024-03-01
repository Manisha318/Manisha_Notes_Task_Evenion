const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Note = require('../models/notes');
const checkAuth = require('../middlewares/checkAuth');


// Add Note
router.post('/addNote', checkAuth, async (req, res) => {
    if(req.user && req.user.id) {
        try {
            const { title, content } = req.body;
            const userId = req.user.id;
      
            // limitation
            const userNotes = await Note.countDocuments({userId})

            if(userNotes >= 50) {
                return res.status(500).json({ error: 'You have reached the limit to add notes' });
            }

            const newNote = new Note({
                title, 
                content,
                userId
            });
      
            const savedNote = await newNote.save();
            res.status(200).json(savedNote);
        } 
        catch (error) {
            res.status(500).json({ error: 'An error occurred while adding the note' });
        }
    }
    else {
        return res.status(401).json({ msg: "User not Found" })
    }
});


// Update Note
router.post('/updateNote', checkAuth, async (req, res) => {
    if(req.user && req.user.id) {
        try {
            const { noteId, title, content } = req.body;
            const userId = req.user.id;
      
            const inputNote = {
                title, 
                content,
                updatedAt: Date.now()
            };
      
            var updatedNote = await Note.findOneAndUpdate({ _id: noteId, userId }, { $set: inputNote });
            if(updatedNote) {
                res.status(200).json({ msg: 'success' });
            }
            else{
                res.status(500).json({ error: 'An error occurred while update the note' });
            }
        } 
        catch (error) {
            res.status(500).json({ error: 'An error occurred while update the note' });
        }
    }
    else {
        return res.status(401).json({ msg: "User not Found" })
    }
});


// view all notes
router.get('/viewAllNote', checkAuth, async (req, res) => {
    if(req.user && req.user.id) {
        try {
            let perPage = 5;
            let page = req.query.page || 1;
            const userId = req.user.id;

            const notes = await Note.aggregate([
                { 
                    $match: { 
                        userId: new mongoose.Types.ObjectId(userId) 
                    } 
                },
                {
                  $project: {
                    title: { $substr: ["$title", 0, 30] },
                    content: { $substr: ["$content", 0, 50] },
                  },
                },
                { $sort: { createdAt: -1 } }
            ])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec(); 

            if(notes){
                res.status(200).json(notes);
            }
            else{
                res.status(500).json({ error: 'An error occurred while fetching notes' });
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while fetching notes' });
        }
    }
    else {
        return res.status(401).json({ msg: "User not Found" })
    }
});


// view note
router.get('/viewNote/:noteId', async (req, res) => {
    if(req.user && req.user.id) {
        try {
            const noteId = req.params.noteId;
            const userId = req.user.id;

            const viewNote = await Note.findOne({ _id: noteId, userId });
            if(viewNote) {
                res.status(200).json(viewNote);
            }
            else{
                res.status(500).json({ error: 'An error occurred while fetching note' });
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while fetching note' });
        }
    }
    else {
        return res.status(401).json({ msg: "User not Found" })
    }
});



// delete note
router.delete('/removeNote/:id', checkAuth, async (req, res) => {
    if(req.user && req.user.id) {
        const { id } = req.params;
        const userId = req.user.id;

        try {
            if (!id) {
                return res.status(400).json({ msg: "Id is required" });
            }
    
            const deletedNote = await Note.findOneAndDelete({ _id: id, userId });
            if(deletedNote){
                res.status(200).json({ msg: 'success' });
            }
            else {
                res.status(500).json({ msg: 'An error occurred while remove note' });
            }
        } catch (error) {
            res.status(500).json({ msg: 'An error occurred while remove note' });
        }
    }
    else {
        return res.status(401).json({ msg: "User not Found" })
    }
})



// search notes
router.get('/searchNote', checkAuth, async (req, res) => {
    if(req.user && req.user.id) {
        try {
            const userId = req.user.id;
            let searchTerm = req.body.searchTerm;
            const searchResults = await Note.find({
                userId,
                $or: [
                    { title: { $regex: new RegExp(searchTerm, "i") } },
                    { content: { $regex: new RegExp(searchTerm, "i") } },
                ]
            })

            if(searchResults){
                res.status(200).json(searchResults);
            }
            else{
                res.status(500).json({ error: 'An error occurred while fetching notes' });
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while fetching notes' });
        }
    }
    else {
        return res.status(401).json({ msg: "User not Found" })
    }
});


module.exports = router;
