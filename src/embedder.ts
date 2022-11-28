import * as Solid from '@inrupt/solid-client-authn-browser'; 
import * as htmlparser2 from 'htmlparser2';

export async function blob2string(blob: Blob) : Promise<string> {
    return await blob.text();
}

export function string2blob(data: string, contentType = 'text/html') : Blob {
    return new Blob([data], {
        type: contentType
    });
}

export async function embedder(html:string, app:string, base?: string) : Promise<string> {
    return new Promise<string>( async (resolve) => {
        let newHtml = [];
        
        const parser = new htmlparser2.Parser({
            onopentag(name, attributes) {
                newHtml.push(`<${name}`);

                for (let key in attributes) {
                    if (name === 'img' && key === 'src') {
                        const imgUrl = absoluteURL(attributes[key],base);
                        const imgDataUrl = makeDataUrl(imgUrl);
                        newHtml.push(` ${escapeHTML(key)}="`);
                        newHtml.push(imgDataUrl);
                        newHtml.push('"');
                    }
                    else if (name === 'a' && key === 'href') {
                        const newUrl = app + '?resource=' + encodeURIComponent(attributes[key]);
                        newHtml.push(` ${escapeHTML(key)}="${newUrl}" target="_top"`); 
                    }
                    else {
                        newHtml.push(` ${escapeHTML(key)}="${escapeHTML(attributes[key])}"`);
                    }
                }

                newHtml.push('>');
            },
            ontext(text) {
                newHtml.push(escapeHTML(text));
            },
            onclosetag(name) {
                newHtml.push(`</${name}>`);
            }
        });

        parser.write(html);
        parser.end();

        Promise.all(newHtml).then( (values) => {
            resolve(values.join(""));
        });
    });
}

async function makeDataUrl(resource: string) : Promise<string> {
    return new Promise<string>( async (resolve) => {
        try {
            console.log(`creating data url for ${resource}`);
            const response = await Solid.fetch(resource); 
            if (response.ok) {
                const blob = await response.blob();
                const dataUrl  = URL.createObjectURL(blob);
                console.log(`..dataUrl = ${dataUrl}`);
                resolve(dataUrl);
            }
            else {
                console.log(`failed to fetch ${resource}`);
                resolve(resource);
            }
        }
        catch (e) {
            console.log(`error when fetching ${resource} : ${e}`);
            console.log(e);
            resolve(resource);
        }
    });
}

function escapeHTML(str: string) : string {
    return new Option(str).innerHTML;
}

function absoluteURL(path: string, base: string) {
    const url = new URL(path,base);
    return url.toString();
}