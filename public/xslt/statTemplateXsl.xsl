<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:colors="colors:colors">
	<xsl:variable name="colors" select="document('')/*/colors:colors/color"/>
	<xsl:variable name="colorCount" select="count($colors)"/>
				<!-- Stroke dasharay : {0 à 0} -> pour partir sur une brodure décalable,
				{0 à (942-taille} -> pour décaler  la portion
				{0 à 942} taille de la portion
				{942 à 942} taille du cercle en pixels	-->
				<!-- TEMPLATE -->
				<xsl:template match="/">
					<html>
						<body>
							<xsl:for-each select="root/stat">
								<xsl:if test="type='camembert'">
									<camembert style="max-width:350px;margin:20px">
										<h3><xsl:value-of select="nom"/></h3>
										<xsl:variable name="total"  select="total"/>
										<svg xmlns="http://www.w3.org/2000/svg"  width="300" height="300" style= "border-radius: 50%;">
											<text x="125" y="125" fill="blue" style="font-size: 20px;">Total:</text>
											<text x="105" y="170" fill="blue" style="font-size: 40px;">
												<xsl:value-of select="$total" />
											</text>
											<xsl:call-template name="camembertRecursif">
												<xsl:with-param name="node" select="./nombres/nombre[1]"/>
												<xsl:with-param name="decalage" select="0"/>
												<xsl:with-param name="total" select="$total"/>
												<xsl:with-param name="position" select="1"/>
											</xsl:call-template>
										</svg>
										<table class="table">
											<tbody>
												<tr>
													<th colspan="2">Nom</th>
													<th>Portion</th>
													<th colspan="2">Pourcentage</th>
												</tr>
												<xsl:call-template name="bodyColTab">
													<xsl:with-param name="node" select="./nombres/nombre[1]"/>
													<xsl:with-param name="total" select="$total"/>
													<xsl:with-param name="position" select="1"/>
												</xsl:call-template>
											</tbody>
										</table>
									</camembert>					
								</xsl:if>
								<xsl:if test="type='histogramme'">
									<xsl:variable name="count"  select="count(./nombres/nombre)"/>
									<histogramme style="max-width:450px;margin:20px">
										<h3>
											<xsl:value-of select="nom"/>
										</h3>
										<xsl:variable name="total"  select="total"/>
										<svg xmlns="http://www.w3.org/2000/svg"  width="450" height="250">

											<xsl:call-template name="histogrammeRecursif">
												<xsl:with-param name="node" select="./nombres/nombre[$count]"/>
												<xsl:with-param name="decalage" select="$count"/>
												<xsl:with-param name="total" select="$total"/>
												<xsl:with-param name="position" select="1"/>
											</xsl:call-template>
											<!-- <line x1="0" y1="0" x2="0" y2="250" style="stroke:green" /> -->
											<!-- <line x1="0" y1="250" x2="450" y2="250" style="stroke:green;stroke-width:2" /> -->
											<line x1="0" y1="50" x2="450" y2="50" style="stroke:red"></line>
											<!-- <text x="15" y="15" fill="crimson" style="font-size: 20px;">Total:</text> -->
											<text x="15" y="50" fill="crimson" style="font-size: 40px;">
												<xsl:value-of select="$total" />
											</text>
										</svg>
										<xsl:choose>
											<xsl:when test="$count&gt;8">
												<table class="table">
													<tbody>
														<tr>
															<th colspan="2">Nom</th>
															<th>Portion</th>
															<th colspan="2">Pourcentage</th>
														</tr>
														<xsl:call-template name="bodyColTab">
															<xsl:with-param name="node" select="./nombres/nombre[1]"/>
															<xsl:with-param name="total" select="$total"/>
															<xsl:with-param name="position" select="1"/>
														</xsl:call-template>
													</tbody>
												</table>
											</xsl:when>
											<xsl:otherwise>
												<div style="position:relative;min-height:200px;width:1000px">
													<xsl:call-template name="labelHistogramme">
														<xsl:with-param name="node" select="./nombres/nombre[1]"/>
														<xsl:with-param name="decalage" select="$count"/>
														<xsl:with-param name="total" select="$total"/>
														<xsl:with-param name="position" select="1"/>
													</xsl:call-template>
												</div>
											</xsl:otherwise>
										</xsl:choose>
									</histogramme>
								</xsl:if>
							</xsl:for-each>
						</body>
					</html>
				</xsl:template>
				<!-- TEMPLATE -->
				<!-- CALL -->
<!-- <xsl:call-template name="histogrammeRecursif">
	<xsl:with-param name="node" select="./nombres/nombre[1]"/>
	<xsl:with-param name="decalage" select="count(./nombres/nombre)"/>
	<xsl:with-param name="total" select="$total"/>
	<xsl:with-param name="position" select="1"/>
</xsl:call-template> -->
<!-- /CALL -->
<xsl:template name="histogrammeRecursif"   xmlns="http://www.w3.org/2000/svg">
	<xsl:param name="node" select="0"/>
	<xsl:param name="decalage" select="0"/>
	<xsl:param name="total" select="1"/>
	<xsl:param name="position" select="1"/>
	<xsl:if test="$node/preceding-sibling::nombre">
		<xsl:call-template name="histogrammeRecursif">
			<xsl:with-param name="node" select="$node/preceding-sibling::nombre[1]"/>
			<xsl:with-param name="decalage" select="$decalage"/>
			<xsl:with-param name="total" select="$total"/>
			<xsl:with-param name="position" select="$position +1"/>
		</xsl:call-template>
	</xsl:if>
	<xsl:variable name="portion" select="substring($node*200 div $total,0,8)"/>
	<xsl:variable name="couleur" select="$colors[($decalage - $position+1) mod $colorCount + 1]"/>
	<xsl:variable name="width" select="substring(300 div $decalage,0,8)"/>
	<xsl:variable name="x" select="substring(300-($position*300 div $decalage),0,8)"/>
	<xsl:variable name="y" select="250-$portion"/>
	<xsl:variable name="p1" select="$x+$width"/>
	<xsl:variable name="p2" select="($y)-($width*0.2)"/>
	<xsl:variable name="p3" select="$x+$width*1.5"/>
	<xsl:variable name="p4" select="$y+$portion"/>
	<rect width="{$width}" x="{$x}" y="{$y}" height="{$portion}" style="fill:{$couleur};stroke:black;stroke-opacity:0.3;stroke-width:3px;"></rect>
	<polygon points="{$x+$width*0.5} {$p2},{$p3} {$p2},{$p1} {$y},{$x} {$y},{$x} {$p4},{$p1} {$p4},{$p1} {$y},{$p3} {$p2},{$p3} {$p4 -$width*0.2},{$p1} {$p4},{$p1} {$y},{$x} {$y}" style="fill:{$couleur};stroke:black;stroke-width:3px;stroke-opacity:0.2;" ></polygon>
</xsl:template>
<!-- /TEMPLATE -->
<!-- CALL -->
<!-- <xsl:call-template name="bodyColTab">
	<xsl:with-param name="node" select="./nombres/nombre[1]"/>
	<xsl:with-param name="total" select="$total"/>
	<xsl:with-param name="position" select="1"/>
</xsl:call-template> -->
<!-- /CALL -->
<!-- TEMPLATE -->
<xsl:template name="bodyColTab"  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:param name="node" select="0"/>
	<xsl:param name="total" select="1"/>
	<xsl:param name="position" select="1"/>

	<xsl:variable name="pourcentage" select="$node div $total*100"/>
	<xsl:variable name="couleur" select="$colors[$position mod $colorCount + 1]"/>
	<tr>
		<td><div style="width: 18px;background-color: {$couleur};border-radius: 50%;height: 18px;"></div></td>
		<td><xsl:if test="$node/@name=''">(Aucun)</xsl:if><xsl:value-of select="$node/@name"/></td>
		<td><xsl:value-of select="$node"/></td>
		<td><xsl:value-of select="substring($pourcentage,0,5)"/></td>
		<td>%</td>
	</tr>
	<xsl:if test="$node/following-sibling::nombre">
		<xsl:call-template name="bodyColTab">
			<xsl:with-param name="node" select="$node/following-sibling::nombre[1]"/>
			<xsl:with-param name="total" select="$total"/>
			<xsl:with-param name="position" select="$position +1"/>
		</xsl:call-template>
	</xsl:if>
</xsl:template>
<!-- TEMPLATE -->
<!-- CALL -->
<!-- <xsl:call-template name="labelHistogramme">
	<xsl:with-param name="node" select="./nombres/nombre[1]"/>
	<xsl:with-param name="decalage" select="count(./nombres/nombre)"/>
	<xsl:with-param name="total" select="$total"/>
	<xsl:with-param name="position" select="1"/>
</xsl:call-template> -->
<!-- /CALL -->
<xsl:template name="labelHistogramme"  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:param name="node" select="0"/>
	<xsl:param name="decalage" select="0"/>
	<xsl:param name="total" select="1"/>
	<xsl:param name="position" select="1"/>
	<xsl:variable name="pourcentage" select="substring($node*100 div $total ,0,6)"/>
	<xsl:variable name="couleur" select="$colors[$position mod $colorCount + 1]"/>
	<xsl:variable name="width" select="substring(370 div $decalage,0,8)"/>
	<xsl:variable name="x" select="substring(($position*370 div $decalage)-(370 div $decalage),0,8)"/>
	<div style="position:absolute;transform:rotate({$decalage*4}deg);transform-origin: top left;left:{$x}px">
		<div><div style="float:left;width: 18px;background-color: {$couleur};border-radius: 50%;height: 18px;"></div>
		<xsl:value-of select="$node/@name"/>: 
		<xsl:value-of select="$node"/>
		(<xsl:value-of select="substring($pourcentage,0,5)"/>%)</div>
	</div>
	<xsl:if test="$node/following-sibling::nombre">
		<xsl:call-template name="labelHistogramme">
			<xsl:with-param name="node" select="$node/following-sibling::nombre[1]"/>
			<xsl:with-param name="decalage" select="$decalage"/>
			<xsl:with-param name="total" select="$total"/>
			<xsl:with-param name="position" select="$position +1"/>
		</xsl:call-template>
	</xsl:if>
</xsl:template>
<!-- /TEMPLATE -->
<!-- /TEMPLATE -->
<!-- TEMPLATE -->
<!-- CALL -->
<!-- <xsl:call-template name="camembertRecursif">
	<xsl:with-param name="node" select="./nombres/nombre[1]"/>
	<xsl:with-param name="decalage" select="0"/>
	<xsl:with-param name="total" select="$total"/>
	<xsl:with-param name="position" select="1"/>
</xsl:call-template> -->
<!-- /CALL -->
<xsl:template name="camembertRecursif"  xmlns="http://www.w3.org/2000/svg">
	<xsl:param name="node" select="0"/>
	<xsl:param name="decalage" select="0"/>
	<xsl:param name="total" select="1"/>
	<xsl:param name="position" select="1"/>
	<xsl:variable name="portion" select="$node div $total *939"/>
	<xsl:if test="$node/following-sibling::nombre">
		<xsl:call-template name="camembertRecursif">
			<xsl:with-param name="node" select="$node/following-sibling::nombre[1]"/>
			<xsl:with-param name="decalage" select="$decalage + $portion"/>
			<xsl:with-param name="total" select="$total"/>
			<xsl:with-param name="position" select="$position +1"/>
		</xsl:call-template>
	</xsl:if>
	<xsl:variable name="couleur" select="$colors[$position mod $colorCount + 1]"/>
	<circle r="150" cx="150" cy="150"  fill-opacity="0" style='stroke:{$couleur};stroke-width: 150;
		stroke-dasharray: 0,{$decalage},{$portion+3},939;'>
	</circle>
</xsl:template>
<colors:colors>
	<color>olive</color>
	<color>royalblue</color>
	<color>yellow</color>
	<color>greenyellow</color>
	<color>lightgreen</color>
	<color>turquoise</color>
	<color>gold</color>
	<color>steelblue</color>
	<color>tan</color>
	<color>green</color>
	<color>aquamarine</color>
	<color>fuchsia</color>
	<color>darkred</color>
	<color>hotpink</color>
	<color>tomato</color>
	<color>dimgray</color>
	<color>orange</color>
	<color>darkslategray</color>
	<color>indigo</color>
	<color>lavender</color>
	<color>darkgray</color>
	<color>coral</color>
	<color>springgreen</color>
	<color>pink</color>
	<color>antiquewhite</color>
	<color>thistle</color>
	<color>lightcyan</color>
	<color>lightcoral</color>
	<color>purple</color>
	<color>violet</color>
	<color>sandybrown</color>
	<color>burlywood</color>
	<color>palegreen</color>
	<color>rosybrown</color>
	<color>lightseagreen</color>
	<color>deepskyblue</color>
	<color>darkgreen</color>
	<color>palegoldenrod</color>
	<color>darkturquoise</color>
	<color>blue</color>
	<color>crimson</color>
	<color>lemonchiffon</color>
	<color>mediumseagreen</color>
	<color>goldenrod</color>
	<color>seagreen</color>
	<color>cornflowerblue</color>
	<color>chartreuse</color>
	<color>saddlebrown</color>
	<color>darkkhaki</color>
	<color>aqua</color>
	<color>chocolate</color>
	<color>orangered</color>
	<color>midnightblue</color>
	<color>khaki</color>
	<color>darkolivegreen</color>
	<color>red</color>
	<color>yellowgreen</color>
	<color>deeppink</color>
	<color>slateblue</color>
	<color>peachpuff</color>
	<color>darkorange</color>
	<color>paleturquoise</color>
	<color>mediumvioletred</color>
	<color>darkslateblue</color>
	<color>mistyrose</color>
	<color>limegreen</color>
	<color>indianred</color>
	<color>palevioletred</color>
	<color>orchid</color>
	<color>sienna</color>
	<color>skyblue</color>
	<color>lime</color>
	<color>dodgerblue</color>
	<color>peru</color>
	<color>plum</color>
</colors:colors>
</xsl:stylesheet>