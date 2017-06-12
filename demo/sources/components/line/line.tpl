<!--
	id : nom du composant
-->
<template id="line">
	<div>{$clickme} [<span el="v"></span>]<span el="content"></span></div>
</template>

<!--
	Les fichiers .tpl peuvent contenir plusieurs templates.
	N'ayant pas un id identique au nom du bundle, module ou composant le rendu
	ne sera pas automatique il se déclenche par la fonction 'rend' :
	this.rend("inside");
		id : nom du template appartenant au composant
		overlay : selector CSS ou pa r l'attribut el de réference pour l'insertion
		position : mode d'insertion dans le DOM
							beforebegin -<p>- afterbegin - beforeend -</p>- afterend, replace
-->
<template id="inside" overlay="content" position="beforeend">
	<span> !! </span>
</template>
