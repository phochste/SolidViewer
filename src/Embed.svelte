<script lang="ts">
    import * as Solid from '@inrupt/solid-client-authn-browser'; 
    import { blob2string, embedder, string2blob } from './embedder';

    export let isPrivate : boolean = false;

    let appUrl = window.location.href.replaceAll(/\?.*/g,'');
    let resource: string;
    let dataUrl : string;
    let dataType : string;
    let error : string;
    let errorDescription : string;

    let getParameter = (url,key) => {
        // Address of the current window
        let address = url.replaceAll(/.*\?/g,'');

        // Returns a URLSearchParams object instance
        let parameterList = new URLSearchParams(address)

        // Returning the respected value associated
        // with the provided key
        return parameterList.get(key)
    };

    loadFromUrl(window.location.href);

    Solid.onLogin( () => {
        loadFromUrl(window.location.href);
    });

    Solid.onSessionRestore( (url) => {
        console.log(`restore session: ${url}`);
        loadFromUrl(url);
    });

    function loadFromUrl(url) {
        console.log(`loading from url: ${url}`);
        const r = getParameter(url,'resource');
        if (r) {
            resource = r;
            loadData(resource);
        }
    } 

    async function isWorldReadable(resource: string) {
        console.log(`checking is private: ${resource}`);
        try {
            const response = await fetch(resource, {
                method: 'HEAD'
            });

            if (response.ok) {
                console.log('...nope');
                return true;
            }
            else if (response.status === 401) {
                console.log('...oh yeah');
                return false;
            }
            else {
                console.log(`...maybe or maybe not: got a ${response.status}`);
                // we don't know what happened ..assume true unless proven false
                return true
            }
        }
        catch (e) {
            console.log(`...maybe or maybe not: got an error`);
            // we don't know what happened ..assume true unless proven false
            return true;
        }
    }

    async function loadData(resource: string) {
        console.log(`fetching ${resource}...`);

        try {
            const response = await Solid.fetch(resource); 

            dataType = response.headers.get('Content-Type');

            if (response.ok) {
                
                if (dataType.startsWith('text/html')) {
                    console.log('start embedding html...');
                    const blob = await response.blob();
                    const htmlStr = await blob2string(blob);
                    const embedStr = await embedder(htmlStr,appUrl,resource);
                    dataUrl = URL.createObjectURL(string2blob(embedStr));
                    console.log(embedStr);
                    console.log('...done embedding html');
                }
                else {
                    const blob = await response.blob();
                    dataUrl = URL.createObjectURL(blob); 
                }

                console.log(dataType);
                console.log(dataUrl);

                error = null;
                errorDescription = null;

                const newUrl = 
                    window.location.href.replaceAll(/\?.*/g,'') +
                    '?resource=' + encodeURIComponent(resource);

                window.history.pushState({},undefined,newUrl);
            }
            else {
                console.log(`failed to fetch ${resource} ${response.status}`);
                error = response.statusText;
                errorDescription = null;
                dataUrl = null;
                dataType = null;
            }
        }
        catch (e) {
            console.log(e);
            error = `Failed to fetch`;
            errorDescription = "Probably this is not a Solid resource?";
        }

        if (! await isWorldReadable(resource)) {
            console.log(`isPrivate: true`);
            isPrivate = true;
        }
        else {
            console.log(`isPrivate: false`);
            isPrivate = false;
        }
    }
</script>
<svelte:head>
    {#if resource}
        <title>Acme Viewer - {resource}</title>
    {:else}
        <title>Acme Viewer</title>
    {/if}
</svelte:head>

<img src="images/reload.png"
     alt="Reload"
     title="Reload"
     width="30" height="30" on:click={ () => loadData(resource) }/>
<input type="text" bind:value={resource} size=80 on:change={async () => loadData(resource)}/>

{#if error} 
<h2>{error}</h2>
    {#if errorDescription}
    <p><i>{errorDescription}</i></p>
    {/if}
{:else if dataUrl}
<iframe id="iframe1" width='100%' height='100%' src={dataUrl}></iframe>
{/if}

{#if isPrivate}
<style type="text/css">
    h2 {
        color: #C0C0F1;
    }

    p {
        color: #C0C0F1;
    }

    #iframe1 {
        background-color: #C0C0F1;
        left: 0px;
        width: 100%;
        top: 65px;
        height: 100%;
    }
</style>
{:else}
    <style type="text/css">
        #iframe1 {
            left: 0px;
            width: 100%;
            top: 65px;
            height: 100%;
        }
    </style>
{/if}