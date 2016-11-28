<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/root/etablissement">
		<html>
			<body>
				<h3><xsl:value-of select="nom"/></h3>
				<table class='table'>
					<tr>
						<th>UAI</th>
						<th>Type</th>
						<th>Sigle</th>
						<th>Statut</th>
						<th>Tutelle</th>
					</tr>
					<tr>
						<td><xsl:value-of select="UAI"/></td>
						<td><xsl:value-of select="type"/></td>
						<td><xsl:value-of select="sigle"/></td>
						<td><xsl:value-of select="statut"/></td>
						<td><xsl:value-of select="tutelle"/></td>
					</tr>
					<tr>
						<th>Université</th>
						<th>Adresse, Ville (CP)</th>
						<th>Département</th>
						<th>Académie</th>
						<th>Région</th>
						<th>Lien</th>
					</tr>
					<tr>
						<td><xsl:value-of select="universite"/></td>
						<td><xsl:value-of select="adresse"/>, <xsl:value-of select="commune"/> (<xsl:value-of select="cp"/>)</td>
						<td><xsl:value-of select="departement"/></td>
						<td><xsl:value-of select="academie"/></td>
						<td><xsl:value-of select="region"/></td>
						<td><a href="{./lien}" target="blank">+infos</a></td>
					</tr>
				</table>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>