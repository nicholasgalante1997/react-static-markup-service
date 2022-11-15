import { writeFileSync, createWriteStream } from 'fs';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import React from 'react';

function App(){
    return (
        <div id="parent">
            <h1>
                React as a Static Page Bundler
            </h1>
            <p>
                Converting a React App to Static Html
            </p>
        </div>
    )
}

/**
 * @summary renderToPipeableStream 
 * https://reactjs.org/docs/react-dom-server.html#rendertopipeablestream
 * ```ts
 * ReactDOMServer.renderToPipeableStream(element, options);
 * ```
 * Render a React element to its initial HTML. 
 * Returns a stream with a pipe(res) method to pipe the output and abort() to abort the request. 
 * Fully supports Suspense and streaming of HTML with “delayed” content blocks “popping in” via inline <script> tags later. 
 * Read more https://github.com/reactwg/react-18/discussions/37
 *
 * If you call ReactDOM.hydrateRoot() on a node that already has this server-rendered markup, 
 * React will preserve it and only attach event handlers, 
 * allowing you to have a very performant first-load experience.
 */

function convertAppToDehydratedMarkupWithRenderToString(){
    let data = '';
    data += `<!DOCTYPE html><body><div id="root">`;
    const html = renderToString(<App />);
    data += html;
    data += `</body></html>`;
    writeFileSync('render-to-string.html', Buffer.from(data), { encoding: 'utf-8' });
}

function convertAppToDehydratedMarkupWithPipeableNodeStream(){
    let writeStream = createWriteStream('render-with-pipeable-stream.html');
    writeStream.write('<!DOCTYPE html><body><div id="root">')
    let error = false;
    const stream = renderToPipeableStream(
    <App />,
    {
        onShellError(err){
            error = true;
            console.log(JSON.stringify(err));
        },
        onError(err) {
            error = true;
            console.log(JSON.stringify(err));
        },
        onAllReady(){
            stream.pipe(writeStream);
            writeStream.write('</body></html>');
            writeStream.end();
        }
    }
    )
}

function exec(){
    convertAppToDehydratedMarkupWithRenderToString();
    convertAppToDehydratedMarkupWithPipeableNodeStream();
}

exec();