/**
 * Create Triptych.js
 *
 *
 * @author Tapani J. Otala
 * @version 2.1
 * @date 2005-2006
 */
var DEF_DOC_NAME = 'Triptych';
var DEF_DOC_MODE = NewDocumentMode.RGB;
var DEF_DOC_FILL = DocumentFill.TRANSPARENT;
var DEF_X_SPACING = 10;
var DEF_Y_SPACING = 10;

var CY_TEXT = 20; // text height
var CX_BTN = 75; // command button width
var CY_BTN = 25; // command button height
var CY_SLD = 15; // slider height

var res = showSettingsDialog();
if (res != null)
{
    var docs = res.sourceImages;
    var n = docs.length;
    var cx = 0, cy = 0, dpi = 0;
    // Find the max width, height & resolution
    for (var i = 0; i < n; i++)
    {
        cx += docs[i].width;
        cy = Math.max(cy, docs[i].height);
        dpi = Math.max(dpi, docs[i].resolution);
    }
    
    // Calculate space between the images
    var xSpace = (cx / n) * res.xSpacing;
    var ySpace = cy * res.ySpacing;
        
    // Create the new blank image (the triptych)
    var newImage = app.documents.add(cx + xSpace * (n + 1),
      cy + ySpace * 2, dpi, res.docName, res.docMode, res.docFill);

    // Copy the images into the triptych as layers
    var sx = xSpace;
    for (var i = 0; i < n; i++)
    {
        // Copy the next image to clipboard
        app.activeDocument = docs[i];
        docs[i].selection.selectAll();
        docs[i].selection.copy(docs[i].layers.length > 1);
        docs[i].selection.deselect();

        // Paste it into the triptych image as a layer
        // Name the layer, and move it to its final position
        app.activeDocument = newImage;
        var newLayer = newImage.paste();
        newLayer.name = docs[i].name;
        newLayer.translate(sx - (newImage.width - docs[i].width) / 2, 0);
        newLayer = null;
        
        sx += docs[i].width + xSpace;
    }
    
    newImage = null;
    docs = null;
    res = null;
}


/**
 * Shows the settings dialog
 *
 * @return object that contains the settings
 */   
function showSettingsDialog()
{
    var docs = app.documents;
    var res = null;
    var dlg = new Window('dialog', 'Create Triptych', [ 0, 0, 610, 450 ]);
    with (dlg)
    {
        center();
        add('panel', [ 10, 10, 600, 10 + 160 ], 'Source Images',
          { name: 'pnlSource' });
        with (pnlSource)
        {
            add('slider', [ 30, 30, 550, 30 + CY_SLD ], 1, 1, docs.length,
              { name: 'sld' }).value = docs.length;
            add('statictext', [ sld.bounds.left - 10, sld.bounds.top - 5,
              sld.bounds.left, sld.bounds.top + CY_TEXT ], '1',
              { justify: 'right' });
            add('statictext', [ sld.bounds.right + 10, sld.bounds.top - 5,
              sld.bounds.right + 30, sld.bounds.top + CY_TEXT ], docs.length,
              { justify: 'left' });
            add('edittext', [ sld.bounds.left, sld.bounds.bottom + 10,
              sld.bounds.right, sld.bounds.bottom + 10 + 80 ], '',
              { name: 'txtSrcNames', multiline: true, readonly: true });
            txtSrcNames.enabled = false;
            
            sld.onChange = function()
              { this.parent.txtSrcNames.text = getFirstNumDocs(this.value); };
            sld.notify();
        }
        
        add('panel', [ 10, 180, 600, 180 + 210 ], 'Destination Image',
          { name: 'pnlDest' });
        with (pnlDest)
        {
            var today = new Date();
            add('edittext', [ 30, 30, 550, 30 + CY_TEXT ],
              DEF_DOC_NAME + ' ' + today.getFullYear(),
              { name: 'txtDestName' });
            
            add('panel', [ 30, 60, 550, 60 + 60 ], 'Spacing',
              { name: 'pnlSpacing' });
            with (pnlSpacing)
            {
                add('statictext', [ 30, 30, 100, 30 + CY_TEXT ],
                  'Horizontal:');
                add('slider', [ 110, 30, 200, 30 + CY_SLD ], 1, 1, 50,
                  { name: 'sldX' }).value = DEF_X_SPACING;
                add('statictext', [ 210, 30, 250, 30 + CY_TEXT ], '',
                  { name: 'lblX' });
                
                sldX.onChange = function()
                  { this.parent.lblX.text = this.value + '%'; };
                sldX.notify();
            
                add('statictext', [ 280, 30, 350, 30 + CY_TEXT ], 'Vertical:');
                add('slider', [ 360, 30, 450, 30 + CY_SLD ], 1, 1, 50,
                  { name: 'sldY' }).value = DEF_Y_SPACING;
                add('statictext', [ 460, 30, 500, 30 + CY_TEXT ], '',
                  { name: 'lblY' });
                
                sldY.onChange = function()
                  { this.parent.lblY.text = this.value + '%'; };
                sldY.notify();
            }
            
            add('panel', [ 30, 130, 550, 130 + 60 ], 'Background Fill',
              { name: 'pnlDocFill' });
            with (pnlDocFill)
            {
                pnlDocFill.defValue = DEF_DOC_FILL;
                initBtn(pnlDocFill, [ 30, 30, 170, 30 + CY_TEXT ],
                  'Background Color', DocumentFill.BACKGROUNDCOLOR);
                initBtn(pnlDocFill, [ 200, 30, 340, 30 + CY_TEXT ],
                  'Transparent', DocumentFill.TRANSPARENT);
                initBtn(pnlDocFill, [ 370, 30, 510, 30 + CY_TEXT ],
                  'White', DocumentFill.WHITE);
            }
        }
        
        add('button', [ dlg.bounds.width - CX_BTN * 3,
                        dlg.bounds.height - CY_BTN * 1.5,
                        dlg.bounds.width - CX_BTN * 2,
                        dlg.bounds.height - CY_BTN * 0.5 ],
                      'OK', { name: 'btnOk' });
        btnOk.onClick = function() { this.parent.close(1); }
        add('button', [ dlg.bounds.width - CX_BTN * 1.5,
                        dlg.bounds.height - CY_BTN * 1.5,
                        dlg.bounds.width - CX_BTN * 0.5, 
                        dlg.bounds.height - CY_BTN * 0.5 ],
                      'Cancel', { name: 'btnCancel' });
        btnCancel.onClick = function() { this.parent.close(2); }
        
        if (show() == 1)
        {
            var res = new Object();
            res.sourceImages = new Array();
            for (var i = 0; i < pnlSource.sld.value; i++)
            {
                res.sourceImages[i] = docs[i];
            }
            with (pnlDest)
            {
                res.docName = txtDestName.text;
                res.docFill = pnlDocFill.selValue;
                res.docMode = DEF_DOC_MODE;
                res.xSpacing = pnlSpacing.sldX.value / 100;
                res.ySpacing = pnlSpacing.sldY.value / 100;
            }
        }
    }
    dlg = null;
    docs = null;
    return (res);
}


/**
 * Initializes an associative radio button within a dialog panel.
 * Sets the radio button if it matches the panel's default value.
 * 
 * @param pnl panel
 * @param pos position
 * @param title title
 * @param val value to associate with the radio button
 */ 
function initBtn(pnl, pos, title, val)
{
    var rb = pnl.add('radiobutton', pos, title);
    rb.onClick = function() { this.parent.selValue = this.theValue; }
    rb.theValue = val;
    if (val == pnl.defValue)
    {
        rb.value = true;
        rb.parent.selValue = val;
    }
    rb = null;
}


/**
 * Rounds a floating point value to specified number of digits
 * 
 * @param num number to round
 * @param digits number of digits after decical point to preserve
 * @return returns the rounded value 
 */ 
function roundFloat(num, digits)
{
    var mul = Math.pow(10, digits);
    return (Math.round(num * mul) / mul);
}


/**
 * Returns a text list of the first N documents open. Each line of the list
 * is formatted as 'doc-name\t\t(x-res X y-res @ zdpi)\r\n' 
 * 
 * @param cnt number of documents to return
 * @return string
 */ 
function getFirstNumDocs(cnt)
{
    var oldUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    var docs = app.documents;
    var names = '';
    for (var i = 0; i < cnt; i++)
    {
        names = names + (i + 1) + '. ' + docs[i].name + '\t\t(' + 
          docs[i].width + ' X ' + docs[i].height + ' @ ' +
          roundFloat(docs[i].resolution, 2) + 'dpi)\r\n';
    }
    app.preferences.rulerUnits = oldUnits;
    docs = null;
    return (names);
}
// end
