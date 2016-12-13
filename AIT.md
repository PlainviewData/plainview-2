# Plainview Discussions:

Demo: http://www.plainview.io/demo

Plainview is a service for providing a new, alternative way to have discussions online

Unlike traditional IM services that have a linear list of messages, Plainview offers users the chance to create conversations that are more represented like a tree.

A single reply can have multiple replies to it, written simulateously or at different points in time.

Every response to a particular message is treated as a "child" node to the original message (it being the parent).

To make this type of structure possible, I had to implement d3.js to make the experience interactive and user-friendly.

Users can zoom in/out and drag the graph in order to see the full scope of the conversation.

Originally made to be an argumantative platform, Plainview offers users the ability to 'cite' public conversations located on the site.

This way, if you're trying to make a point that's already made before on the site, you can just reference an existing response.

