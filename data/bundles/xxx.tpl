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
	id : nom du bundle (ici xxx)
	Ce template ayant le nom du bundle va être ajouté à
	l'élément <body>
-->
<template id="xxx">
<h1 class="title">{$title}</h1>
</template>
