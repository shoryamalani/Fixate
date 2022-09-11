# This is once again another file that is taken from AW becuase it doesnt need to be remade. it was then added to and modified to work with my setup
import os
import json
import logging
from typing import Dict
from AppKit import NSApplication, NSApp, NSWorkspace
logger = logging.getLogger(__name__)
script = None


def compileScript():
    """
    Compiles the JXA script and caches the result.

    Resources:
     - https://stackoverflow.com/questions/44209057/how-can-i-run-jxa-from-swift
     - https://stackoverflow.com/questions/16065162/calling-applescript-from-python-without-using-osascript-or-appscript
    """

    # use a global variable to cache the compiled script for performance
    global script
    if script:
        return script

    from OSAKit import OSAScript, OSALanguage

    scriptPath = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "get_app_status.jxa"
    )
    with open(scriptPath) as f:
        scriptContents = f.read()

        # remove shebang line
        if scriptContents.split("\n")[0].startswith("#"):
            scriptContents = "\n".join(scriptContents.split("\n")[1:])

    script = OSAScript.alloc().initWithSource_language_(
        scriptContents, OSALanguage.languageForName_("JavaScript")
    )
    success, err = script.compileAndReturnError_(None)

    # should only occur if jxa was modified incorrectly
    if not success:
        raise Exception(f"error compiling jxa script: {err['NSLocalizedDescription']}")

    return script


def getInfo() -> Dict[str, str]:
    script = compileScript()

    result, err = script.executeAndReturnError_(None)

    if err:
        # error structure:
        # {
        #     NSLocalizedDescription = "Error: Error: Can't get object.";
        #     NSLocalizedFailureReason = "Error: Error: Can't get object.";
        #     OSAScriptErrorBriefMessageKey = "Error: Error: Can't get object.";
        #     OSAScriptErrorMessageKey = "Error: Error: Can't get object.";
        #     OSAScriptErrorNumberKey = "-1728";
        #     OSAScriptErrorRangeKey = "NSRange: {0, 0}";
        # }
        front_app = get_frontmost_app()
        return {'app':front_app["NSApplicationName"]}, front_app

    return json.loads(result.stringValue()),get_frontmost_app()
def get_frontmost_app():
    return NSWorkspace.sharedWorkspace().activeApplication()
