@echo off
set MAVEN_OPTS=-Xmx512m
set MVNW_REPOURL=https://repo.maven.apache.org/maven2
set MAVEN_HOME=%~dp0.mvn\wrapper
"%MAVEN_HOME%\mvnw.cmd" %*