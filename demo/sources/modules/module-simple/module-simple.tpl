<!--
	id : nom du module
	overlay : selector CSS de réference pour l'insertion
	position : mode d'insertion dans le DOM
						beforebegin -<p>- afterbegin - beforeend -</p>- afterend, replace
-->

<template id="module-simple" overlay="#content" position="replace">
	<h2 class="subtitle">{$title}</h2>

	<form el="form" evt="form">
		<p>
			<label>{$txt}</label>
			<input type="text" name="txt" required="required" placeholder="{$txt}"/>
		</p>

		<div>
			<button>{$ok}</button>
		</div>
	</form>

	<h2 class="subtitle">{$rendcp}</h2>
	<div id="result"></div>
</template>

<template id="module-simple-line" overlay="#result" position="beforeend">
	<line></line>
</template>
