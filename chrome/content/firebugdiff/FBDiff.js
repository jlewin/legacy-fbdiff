/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Christoph Dorn.
 *
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *     Christoph Dorn <christoph@christophdorn.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

FBL.ns(function() { with (FBL) { 

var domUtils = null;
try {
    domUtils = CCSV("@mozilla.org/inspector/dom-utils;1", "inIDOMUtils");
} catch (exc) {
    // We can try to live without "dom-utils", since it only comes with DOM Inspector
}

var JImportRuleTag = 
    DIV("@import &quot; $rule.rule.href &quot;;");

var JStyleRuleTag =
    DIV("$rule.selector {\\n",
        FOR("prop", "$rule.props", 
            "\\t$prop.name : $prop.value$prop.important;\\n"
        ),
        "}\\n");
        
Firebug.FBDiff = extend(Firebug.Module, 
{
    template: domplate(
    {
        tag:
            FOR("rule", "$rules",
                TAG("$rule.tag", {rule: "$rule"})
            )
    }),

    showPanel: function(browser, panel) 
    { 
        // When showPanel is called, check to see if it's the panel we belong to
        var isFBDiff = panel && panel.name == "stylesheet"; 
        
        // Grab a reference to the XUL hbox containing our buttons
        var FBDiffButtons = browser.chrome.$("fbDiffButton"); 
        
        // Call collapse on the hbox
        collapse(FBDiffButtons, !isFBDiff); 
    },
    getStyleSheetRules: function(context, styleSheet)
    {
        function appendRules(cssRules)
        {
            for (var i = 0; i < cssRules.length; ++i)
            {
                var rule = cssRules[i];
                if (rule instanceof CSSStyleRule)
                {
                    var props = stylesheetPanel.getRuleProperties(context, rule);
                    var line = domUtils.getRuleLine(rule);
                    var ruleId = rule.selectorText+"/"+line;
                    
                    // Remove disabled items
                    for(var ix = 0; ix < props.length; ix++)
                    {
                        if(props[ix].disabled)
                        {
                            props.splice(ix, 1);
                            ix = -1;
                        }
                    }
                    
                    
                    rules.push({tag: JStyleRuleTag, rule: rule, id: ruleId,
                                selector: rule.selectorText, props: props});
                                
                }
                else if (rule instanceof CSSImportRule)
                    rules.push({tag: JImportRuleTag, rule: rule});
                else if (rule instanceof CSSMediaRule)
                    appendRules.apply(this, [rule.cssRules]);
            }
        }

        var stylesheetPanel = FirebugContext.getPanel("stylesheet")
        var rules = [];
        appendRules.apply(this, [styleSheet.cssRules]);
        return rules;
    },
    startDiff: function()
    {
        // Get current CSS
        var changedCSS = this.getCSS();
        
        // Neil Fraser
        // Diff source and sample code provided by Neil Fraser
        // http://code.google.com/p/google-diff-match-patch/
        var dmp = new diff_match_patch();

        // Options
        var cost = 8, timeout = 4;
        dmp.Diff_Timeout = parseInt(timeout);
        dmp.Diff_EditCost = parseInt(cost);

        debugger;

        // Main diff
        var d = dmp.diff_main(FirebugContext.initialCSS, changedCSS);

        // Options?
        if (true) {
            dmp.diff_cleanupSemantic(d);
        }
        if (false) {
            dmp.diff_cleanupEfficiency(d);
        }
        var res = dmp.diff_prettyHtml(d);
        
        // Restore h1s
        res = res.replace(/~(\/)?h1~/gi, "<$1h1>");
        
        // Display  
        Firebug.FBDiff.showDiff(res);  
        
    },
    getCSS: function()
    {
        var stylesheetPanel = FirebugContext.getPanel("stylesheet");
        var stylesheets = stylesheetPanel.getLocationList();
        var outNode = content.document.createElement("div");
        var text = "";

        debugger;
        
        var rules;
        
        // Process each css location        
        for( var i = 0; i < stylesheets.length; i++)
        {
            // Create the stylesheet text
            rules = this.getStyleSheetRules(stylesheetPanel.context, stylesheets[i]);
            this.template.tag.replace({rules: rules}, outNode);
        
            // Format the panel html into semi-clean text
            text = text + this.formatText("~h1~" + stylesheets[i].href + "~/h1~" + outNode.innerHTML);
        }
        
        return text;
        
    },
    loadedContext: function(context)
    {
        context.initialCSS = Firebug.FBDiff.getCSS();
    },
    showDiff: function(text)
    {
       text = "<link rel='stylesheet' type='text/css' href='chrome://firebugdiff/content/diff.css'><div class='diff'>" + text + "</div>";
        
        openNewTab("about:blank");
        var generatedPage = window.content;
        
        window.addEventListener("DOMContentLoaded", function(){
           
           if(generatedPage.document)
           {
                generatedPage.document.body.innerHTML = text;
           }
            
        }, true);
    },
   formatText: function(html) {
        // Strip all tags
        return html.replace(/<\/?[^>]+>/gi, "");
   }
}); 

Firebug.registerModule(Firebug.FBDiff); 

}});
