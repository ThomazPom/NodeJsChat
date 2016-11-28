<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<html>
			<body>
				<h2>Liste des établissements</h2>
				<xsl:for-each select="root/etabGroup">
					<xsl:variable name="namegroup" select="generate-id(.) "></xsl:variable>
					<div class="panel panel-default" id="{$namegroup}" >
						<div class="panel-heading" role="tab" id="heading{$namegroup}">
							<h4 class="panel-title">
								<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse{$namegroup}" aria-expanded="false" aria-controls="collapse{$namegroup}">
									<xsl:if test="./@name=''">(Aucun)</xsl:if>
									<xsl:value-of select="./@name"/>
								</a>
							</h4>
						</div>
						<div id="collapse{$namegroup}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading{$namegroup}">
							<div class="panel-body">
								<div class="panel-group" role="tablist" aria-multiselectable="false">
									<xsl:for-each select="etablissement">
										<xsl:variable name="nameEtab"  select="generate-id(.)"/>
										<xsl:variable name="UAI"  select="UAI"/>
										<div class="panel panel-default"  title="{UAI}" id="{$nameEtab}" onclick="viewEtab(this)">
											<div class="panel-heading" role="tab" id="heading{$nameEtab}">
												<h4 class="panel-title">
													<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse{$nameEtab}" aria-expanded="false" aria-controls="collapse{$nameEtab}">
														<xsl:value-of select="nom"/>
													</a>
												</h4>
											</div>
											<div id="collapse{$nameEtab}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading{$nameEtab}">
												<div class="panel-body">
												</div>
											</div>
										</div>
									</xsl:for-each>

								</div>
							</div>
						</div>
					</div>
				</xsl:for-each>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>