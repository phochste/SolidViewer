<script lang="ts">
    import { solidDatasetAsMarkdown } from '@inrupt/solid-client';
    import * as Solid from '@inrupt/solid-client-authn-browser'; 

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

    async function loadData(resource: string) {
        console.log(`fetching ${resource}...`);

        try {
            const response = await Solid.fetch(resource); 

            if (response.ok) {
                const blob = await response.blob();
                dataUrl = URL.createObjectURL(blob);
                dataType = response.headers.get('Content-Type');
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
    }
</script>
<svelte:head>
    <title>Solid Viewer - {resource}</title>
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

<style type="text/css">
    #iframe1 {
        left: 0px;
        width: 100%;
        top: 65px;
        height: 100%;
    }
</style>