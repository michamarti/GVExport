<?php

namespace vendor\WebtreesModules\gvexport;
use Fisharebest\Webtrees\I18N;

/**
 * Help object for help information of each option in GVExport
 */
class Help
{
    private array $help;
    public const NOT_FOUND = 'Help information not found';
    public const HOME = 'Home';
    public const PEOPLE_TO_INCLUDE = 'People to be included';
    public const APPEARANCE = 'Appearance';
    public const GENERAL_SETTINGS = 'General settings';
    public const GETTING_STARTED = 'Getting started';
    public const ABOUT = 'About GVExport';
    public const DETAILED_INFORMATION = 'Detailed information';
    public const INCLUDE_RELATED_TO = 'Include anyone related to';
    public const CONNECTIONS_TO_INCLUDE = 'Connections to include';
    public const XREFs_OF_INDIVIDUALS = 'XREFs of included individuals';
    public const STOP_PROCESSING_ON = 'Stop processing on';
    public const NON_RELATIVES = 'Non-relatives';
    public const TREATMENT_OF_SOURCE_INDIVIDUALS = 'Treatment of source individuals';
    public const GRAPH_DIRECTION = 'Graph direction';
    public const DIAGRAM_TYPE = 'Diagram type';
    public const TILE_DESIGN = 'Tile design';
    public const TILE_CONTENTS = 'Tile contents';
    public const DIAGRAM_APPEARANCE = 'Diagram';
    public const OUTPUT_FILE = 'Output file';
    public const BROWSER_RENDER = 'Browser render';
    public const SAVE_SETTINGS = 'Save settings';
    public const SETTINGS_FILE = 'Settings file';
    public const MESSAGE_HISTORY = 'Message history';

    private array $help_location = [
            self::HOME => '',
            self::NOT_FOUND => '',
            'Getting started' => '',
            self::ABOUT => '',
            self::DETAILED_INFORMATION => '',
            self::PEOPLE_TO_INCLUDE => 'Detailed information/',
            self::INCLUDE_RELATED_TO => 'Detailed information/People to be included/',
            self::CONNECTIONS_TO_INCLUDE => 'Detailed information/People to be included/',
            self::XREFs_OF_INDIVIDUALS => 'Detailed information/People to be included/',
            self::STOP_PROCESSING_ON => 'Detailed information/People to be included/',
            self::NON_RELATIVES => 'Detailed information/People to be included/',
            self::TREATMENT_OF_SOURCE_INDIVIDUALS => 'Detailed information/People to be included/',
            self::APPEARANCE => 'Detailed information/',
            self::GRAPH_DIRECTION => 'Detailed information/Appearance/',
            self::DIAGRAM_TYPE => 'Detailed information/Appearance/',
            self::TILE_DESIGN => 'Detailed information/Appearance/',
            self::TILE_CONTENTS => 'Detailed information/Appearance/',
            self::DIAGRAM_APPEARANCE => 'Detailed information/Appearance/',
            self::OUTPUT_FILE => 'Detailed information/General settings/',
            self::BROWSER_RENDER => 'Detailed information/General settings/',
            self::SAVE_SETTINGS => 'Detailed information/General settings/',
            self::SETTINGS_FILE => 'Detailed information/General settings/',
            self::MESSAGE_HISTORY => 'Detailed information/General settings/',
        ];

    public function __construct()
    {
        // Array of help items and the content of each - TODO to be removed when new help system complete
        $this->help[0][0] = "";
        $this->help[0][1] = "";
        $this->help[1][0] = "";
        $this->help[1][1] = "";
        $this->help[2][0] = "";
        $this->help[2][1] = "";
        $this->help[3][0] = "";
        $this->help[3][1] = "";
        $this->help[4][0] = "";
        $this->help[4][1] = "";
        $this->help[5][0] = "";
        $this->help[5][1] = "";
        $this->help[6][0] = "";
        $this->help[6][1] = "";
        $this->help[7][0] = "";
        $this->help[7][1] = "";
        $this->help[8][0] = "";
        $this->help[8][1] = "";
        $this->help[9][0] = "Clippings cart";
        $this->help[9][1] = "Within webtrees, you can add items to the clippings cart. This is usually done by navigating to a record within webtrees then selecting the &quot;Clippings cart&quot; option near the top of the screen.</p><p> If you have added individuals and the related family and media records to the clippings cart, these can be used to display the diagram instead of the criteria in the &quot;People to be included&quot; section.</p><p>If you have individuals in the clippings cart but don't wish to use these, you have the option to ignore the clippings cart.";
        $this->help[10][0] = "";
        $this->help[10][1] = "";
        $this->help[11][0] = "";
        $this->help[11][1] = "";
        $this->help[12][0] = "";
        $this->help[12][1] = "";
        $this->help[13][0] = "";
        $this->help[13][1] = "";
        $this->help[14][0] = "";
        $this->help[14][1] = "";
        $this->help[15][0] = "List of diagrams";
        $this->help[15][1] = "You can select from the list to load some saved settings. Settings can be added or changed using the options in the advanced section of the &quot;General settings&quot; section.";
    }

    /**
     * Adds JavaScript code for function that provides the help text
     * @return string
     */
    public function addHelpMessageJavaScript(): string
    {
        $msg = "
// Function to get help text based on identifier
// item - the help item identifier
function getHelpText(item) {
    switch (item) {";

            for ($i=0; $i<sizeof($this->help); $i++) {
                $msg .= "case \"" . $this->help[$i][0] . "\":\n";
                $msg .= "    return '<h2 class=\"help-title\">" . $this->translateClean($this->help[$i][0]) . "</h2>";
                $msg .= "<p>" . $this->translateClean($this->help[$i][1]) . "</p>';\n";
            }
        $msg .= "case \"enable_debug_mode\":
            return '<textarea cols=50 rows=20 onclick=\"this.select()\">' + debug_string + '</textarea>';
        default:
            return  '" . $this->translateClean("Help information not found") . ": ' + item;
        }
    }";
        return $msg;
    }

    /** Take provided translation and remove any line break, replace ' with &apos; to prevent issue with javascript
     * @param $msg
     * @return string
     */
    private function translateClean($msg): string
    {
        return str_replace(array("\r", "\n"), '',str_replace("'","&apos;",I18N::translate($msg)));
    }

    /**
     * Checks if $help is a valid name of a help view
     *
     * @param $help
     * @return bool
     */
    public function helpExists($help): bool
    {
        if (array_key_exists($help, $this->help_location)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns the location of the requested help view relative to the Help directory
     *
     * @param $help
     * @return mixed|string
     */
    public function getHelpLocation($help) {
            return $this->help_location[$help];
    }
}