<script lang="ts">
	import Login from './Login.svelte';
	import Logout from './Logout.svelte';
	import Embed from './Embed.svelte';

	export let name: string;
	let profile: any;
	let isPrivate: boolean;

	$: if (isPrivate) {
		document.body.classList.add('private');
	}
	else {
		document.body.classList.remove('private');
	}
</script>

<nav class="navbar navbar-default">
	<div class="container-fluid">
	  <div class="navbar-header">
		<span class="navbar-brand">{name}</span>
	  </div>
	  <ul class="nav navbar-nav">
		<li>
			<Logout bind:profile={profile}/>
		</li>
	  </ul>
	</div>
</nav>

<Login bind:profile={profile}/>
<Embed bind:isPrivate={isPrivate}/>

{#if isPrivate} 
	<style type="text/css">
		.navbar {
			background-color: #343261;
		}

		.navbar-brand {
			color: #ffffff !important;
		}
	</style>
{/if}