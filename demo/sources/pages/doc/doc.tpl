
<!--
	id : pageHeader
	le template "pageHeader" est template spécifique
	qui ajoute des éléments à la balise <header> de la page
-->
<template id="pageHeader">
<title>{$title}</title>
<link rel="icon" type="image/png" href="medias/favicon.png"/>
<link rel="shortcut icon" type="image/x-icon" href="medias/favicon.ico"/>
</template>


<!--
	id : nom du bundle (ici doc)
	type : type de contenu (ici markdown) [default:xml]
	Ce template ayant le nom de lapage va être ajouté à
	la basie <body> de la page
-->
<template id="doc" type="markdown">

# {$title}

## {$subtitle}

![Schema NMICRO-CLIENT](medias/nm-schema.svg)

## {$bundle}

```shell-session
> bundles/xxx/xxx.js
```


```js
module.exports = {

	// Bundle xxx
	// xxx.html

	// ------------------------------------------------------------------
	restriction : null, // 'web' or 'app'

	// ------------------------------------------------------------------
	// dependencies

	// module dependencies
	modules : [],

	// component dependencies
	components : [],

	// API dependencies
	apis : [],

	// ------------------------------------------------------------------
	public : {

	},

	// ------------------------------------------------------------------
	private : {
		// initialization
		init : function(){
			console.log('xxx');
		}
	},

	// ------------------------------------------------------------------
	scenaridev : []
};

```

</template>
