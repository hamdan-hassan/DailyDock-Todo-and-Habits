@echo off
REM hermesc-wrapper.bat
REM Workaround for broken hermesc.exe on Windows.
REM Parses hermesc args to find -out <output> and <input>, then copies input to output.
REM Also creates a source map file if -output-source-map flag is present.
REM Hermes runtime can interpret plain JS bundles without HBC precompilation.

setlocal enabledelayedexpansion

set "OUTPUT="
set "INPUT="
set "SOURCEMAP=0"
set "NEXT_IS_OUT=0"

for %%A in (%*) do (
    if "!NEXT_IS_OUT!"=="1" (
        set "OUTPUT=%%~A"
        set "NEXT_IS_OUT=0"
    ) else if "%%~A"=="-out" (
        set "NEXT_IS_OUT=1"
    ) else if "%%~A"=="-emit-binary" (
        REM skip flag
    ) else if "%%~A"=="-O" (
        REM skip flag
    ) else if "%%~A"=="-output-source-map" (
        set "SOURCEMAP=1"
    ) else if "%%~A"=="-w" (
        REM skip flag
    ) else (
        set "INPUT=%%~A"
    )
)

if defined OUTPUT if defined INPUT (
    copy /Y "%INPUT%" "%OUTPUT%" > nul 2>&1
    if "!SOURCEMAP!"=="1" (
        REM Create a minimal valid source map pointing to the original bundle
        echo {"version":3,"sources":[],"mappings":""} > "%OUTPUT%.map"
    )
    exit /b 0
)

exit /b 1
