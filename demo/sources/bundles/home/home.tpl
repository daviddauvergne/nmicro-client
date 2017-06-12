
<!--
	id : bundleHeader
	le template "bundleHeader" est template spécifique
	qui ajoute des éléments à la balise <header> du bundle
-->
<template id="bundleHeader">
<title>{$title}</title>
<link rel="icon" type="image/png" href="medias/favicon.png"/>
<link rel="shortcut icon" type="image/x-icon" href="medias/favicon.ico"/>
</template>


<!--
	id : nom du bundle (ici home)
	Ce template ayant le nom du bundle va être ajouté à
	la basie <body> du bundle
-->
<template id="home">

	<h1 class="title">{$title}</h1>
	<h2 class="subtitle">{$openconsole}</h2>
	<div class="toolbar">
		<button evt="test-private">{$button.private}</button>
		<button evt="test-public">{$button.public}</button>
		<button evt="test-multiTemplates">{$button.multiTemplates}</button>
		<button evt="test-dialog">{$button.dialog}</button>
		<button evt="test-module-simple">{$button.simple}</button>
	</div>

	<div id="content"></div>

</template>

<!--
	Les fichiers .tpl peuvent contenir plusieurs templates.
	N'ayant pas un id identique au nom du bundle, module ou composant le rendu
	ne sera pas automatique il se déclenche par la fonction 'rend' :
	this.rend("home-multiTemplates");
	id : nom du template
	overlay : selector CSS de réference pour l'insertion
	position : mode d'insertion dans le DOM
						beforebegin -<p>- afterbegin - beforeend -</p>- afterend, replace
-->
<template id="home-multiTemplates" overlay="#content" position="beforeend">
	<div style="text-align:center;">
		<img el="img" />
		<div el="title" evt="test-private"></div>
	</div>
</template>
