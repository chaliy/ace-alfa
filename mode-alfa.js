define('ace/mode/alfa', function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var Tokenizer = require("ace/tokenizer").Tokenizer;
    var AlfaHighlightRules = require("ace/mode/alfa_highlight_rules").AlfaHighlightRules;
    var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
    var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
    var CStyleFoldMode = require("./folding/cstyle").FoldMode;
    var alfaSnippets = require("ace/snippets/alfa");
    var snippetManager = require("ace/snippets").snippetManager;

    var Mode = function() {
        this.$tokenizer = new Tokenizer(new AlfaHighlightRules().getRules());
        this.$outdent = new MatchingBraceOutdent();
        this.$behaviour = new CstyleBehaviour();
        this.foldingRules = new CStyleFoldMode();

        alfaSnippets.snippets = snippetManager.parseSnippetFile(alfaSnippets.snippetText);        
        snippetManager.register(alfaSnippets.snippets, "alfa");
    };
    oop.inherits(Mode, TextMode);

    (function() {
        
        this.lineCommentStart = "//";
        this.blockComment = {start: "/*", end: "*/"};

        // TODO editor is not supposed to be access from here        
        editor.commands.bindKey("Tab", function(editor) {
            var success = snippetManager.expandWithTab(editor);
            if (!success)
                editor.execCommand("indent");
        });

        this.getNextLineIndent = function(state, line, tab) {
            var indent = this.$getIndent(line);

            var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
            var tokens = tokenizedLine.tokens;
            var endState = tokenizedLine.state;

            if (tokens.length && tokens[tokens.length-1].type == "comment") {
                return indent;
            }

            if (state == "start" || state == "no_regex") {
                var match = line.match(/^.*(?:\bcase\b.*\:|[\{\(\[])\s*$/);
                if (match) {
                    indent += tab;
                }
            } else if (state == "doc-start") {
                if (endState == "start" || endState == "no_regex") {
                    return "";
                }
                var match = line.match(/^\s*(\/?)\*/);
                if (match) {
                    if (match[1]) {
                        indent += " ";
                    }
                    indent += "* ";
                }
            }

            return indent;
        };

        this.checkOutdent = function(state, line, input) {
            return this.$outdent.checkOutdent(line, input);
        };

        this.autoOutdent = function(state, doc, row) {
            this.$outdent.autoOutdent(doc, row);
        };

    }).call(Mode.prototype);

    exports.Mode = Mode;
});

define('ace/mode/alfa_highlight_rules', function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var AlfaHighlightRules = function() {

        var keywordMapper = this.createKeywordMapper({            
            "keyword": "import|namespace|policyset|target|apply|policy|policyCombinator|ruleCombinator|rule|condition|clause|function|infix|inv|obligation|advice|attribute|function|type|category|id",
            "variable.language":
                // Functions
                "stringEqual|booleanEqual|integerEqual|doubleEqual|dateEqual|timeEqual|dateTimeEqual|dayTimeDurationEqual|yearMonthDurationEqual|stringEqualIgnoreCase|anyURIEqual|x500NameEqual|rfc822NameEqual|hexBinaryEqual|base64BinaryEqual|" + 
                "integerAdd|doubleAdd|integerSubtract|doubleSubtract|integerMultiply|doubleMultiply|integerDivice|doubleDivide|integerMod|integerAbs|doubleAbs|round|floor|" + 
                "stringNormalizeSpace|stringNormalizeToLowerCase|doubleToInteger|integerToDouble|orFunction|andFunction|nOf|not|" + 
                "integerGreaterThan|integerGreaterThanOrEqual|integerLessThan|integerLessThanOrEqual|doubleGreaterThan|doubleGreaterThanOrEqual|doubleLessThan|doubleLessThanOrEqual|" + 
                "dateTimeAddDayTimeDuration|dateTimeAddYearMonthDuration|dateTimeSubtractDayTimeDuration|dateTimeSubtractYearMonthDuration|dateAddYearMonthDuration|dateSubtractYearMonthDuration|" + 
                "stringGreaterThan|stringGreaterThanOrEqual|stringLessThan|stringLessThanOrEqual|" + 
                "timeGreaterThan|timeGreaterThanOrEqual|timeLessThan|timeLessThanOrEqual|timeInRange|" + 
                "dateTimeGreaterThan|dateTimeGreaterThanOrEqual|dateTimeLessThan|dateTimeLessThanOrEqual|dateGreaterThan|dateGreaterThanOrEqual|dateLessThan|dateLessThanOrEqual|" + 
                "stringOneAndOnly|stringBagSize|stringIsIn|stringBag|" + 
                "booleanOneAndOnly|booleanBagSize|booleanIsIn|booleanBag|" + 
                "integerOneAndOnly|integerBagSize|integerIsIn|integerBag|" + 
                "doubleOneAndOnly|doubleBagSize|doubleIsIn|doubleBag|" + 
                "timeOneAndOnly|timeBagSize|timeIsIn|timeBag|dateOneAndOnly|dateBagSize|dateIsIn|dateBag|dateTimeOneAndOnly|dateTimeBagSize|dateTimeIsIn|dateTimeBag|" + 
                "anyURIOneAndOnly|anyURIBagSize|anyURIIsIn|anyURIBag|" + 
                "hexBinaryOneAndOnly|hexBinaryBagSize|hexBinaryIsIn|hexBinaryBag|base64BinaryOneAndOnly|base64BinaryBagSize|base64BinaryIsIn|base64BinaryBag|" + 
                "dayTimeDurationOneAndOnly|dayTimeDurationBagSize|dayTimeDurationIsIn|dayTimeDurationBag|" + 
                "yearMonthDurationOneAndOnly|yearMonthDurationBagSize|yearMonthDurationIsIn|yearMonthDurationBag|" + 
                "x500NameOneAndOnly|x500NameBagSize|x500NameIsIn|x500NameBag|" + 
                "rfc822NameOneAndOnly|rfc822NameBagSize|rfc822NameIsIn|rfc822NameBag|" + 
                "ipAddressOneAndOnly|ipAddressBagSize|ipAddressBag|dnsNameOneAndOnly|dnsNameBagSize|dnsNameBag|" + 
                "stringConcatenate|" + 
                "booleanFromString|stringFromBoolean|integerFromString|stringFromInteger|doubleFromString|stringFromDouble|timeFromString|stringFromTime|dateFromString|stringFromDate|dateTimeFromString|stringFromDateTime|" + 
                "anyURIFromString|stringFromAnyURI|dayTimeDurationFromString|stringFromDayTimeDuration|yearMonthDurationFromString|stringFromYearMonthDuration|x500NameFromString|" + 
                "stringFromX500Name|rfc822NameFromString|stringFromRfc822Name|ipAddressFromString|stringFromIpAddress|dnsNameFromString|stringFromDnsName|" + 
                "stringStartWith|anyURIStartsWith|stringEndsWith|anyURIEndsWith|stringContains|anyURIContains|stringSubString|anyURISubString|" + 
                "anyOf|allOf|anyOfAny|allOfAny|anyOfAll|allOfAll|map|" + 
                "x500NameMatch|rfc822NameMatch|stringRegexpMatch|anyURIRegexpMatch|ipAddressRegexpMatch|dnsNameRegexpMatch|rfc822NameRegexpMatch|x500NameRegexpMatch|" + 
                "xpathNodeCount|xpathNodeEqual|xpathNodeMatch|" + 
                "stringIntersection|stringAtLeastOneMemberOf|stringUnion|stringSubSet|stringSetEquals|" + 
                "booleanIntersection|booleanAtLeastOneMemberOf|booleanUnion|booleanSubSet|booleanSetEquals|" + 
                "integerIntersection|integerAtLeastOneMemberOf|integerUnion|integerSubSet|integerSetEquals|" + 
                "doubleIntersection|doubleAtLeastOneMemberOf|doubleUnion|doubleSubSet|doubleSetEquals|" + 
                "timeIntersection|timeAtLeastOneMemberOf|timeUnion|timeSubSet|timeSetEquals|" + 
                "dateIntersection|dateAtLeastOneMemberOf|dateUnion|dateSubSet|dateSetEquals|" + 
                "dateTimeIntersection|dateTimeAtLeastOneMemberOf|dateTimeUnion|dateTimeSubSet|dateTimeSetEquals|" + 
                "anyURIIntersection|anyURIAtLeastOneMemberOf|anyURIUnion|anyURISubSet|anyURISetEquals|" + 
                "hexBinaryIntersection|hexBinaryAtLeastOneMemberOf|hexBinaryUnion|hexBinarySubSet|hexBinarySetEquals|" + 
                "base64BinaryIntersection|base64BinaryAtLeastOneMemberOf|base64BinaryUnion|base64BinarySubSet|base64BinarySetEquals|" + 
                "dayTimeDurationIntersection|dayTimeDurationAtLeastOneMemberOf|dayTimeDurationUnion|dayTimeDurationSubSet|dayTimeDurationSetEquals|" + 
                "yearMonthDurationIntersection|yearMonthDurationAtLeastOneMemberOf|yearMonthDurationUnion|yearMonthDurationSubSet|yearMonthDurationSetEquals|" + 
                "x500NameIntersection|x500NameAtLeastOneMemberOf|x500NameUnion|x500NameSubSet|x500NameSetEquals|" + 
                "rfc822NameIntersection|rfc822NameAtLeastOneMemberOf|rfc822NameUnion|rfc822NameSubSet|rfc822NameSetEquals|",
            "constant.language": 
                "true|false|permit|deny" +
                "denyOverrides|permitOverrides|firstApplicable|orderedDenyOverrides|orderedPermitOverrides|denyUnlessPermit|permitUnlessDeny|"  + // Rule combinators
                "denyOverrides|permitOverrides|firstApplicable|onlyOneApplicable|orderedDenyOverrides|orderedPermitOverrides|denyUnlessPermit|permitUnlessDeny|"  + // Policy combinators
                "anyURI|boolean|date|dateTime|dnsName|double|integer|ipAddress|time|string|dayTimeDuration|yearMonthDuration|x500Name|rfc822Name|hexBinary|base64Binary|xpath|"   + // Data type
                "subjectCat|resourceCat|actionCat|environmentCat|" // Categories
        }, "identifier");

        var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
            "u[0-9a-fA-F]{4}|" + // unicode
            "[0-2][0-7]{0,2}|" + // oct
            "3[0-6][0-7]?|" + // oct
            "37[0-7]?|" + // oct
            "[4-7][0-7]?|" + //oct
            ".)";

        this.$rules = {
            "start" : [
                {
                    token : "comment",
                    regex : "\\/\\/.*$"
                },
                {
                    token : "keyword.operator",
                    regex : "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|and|or"
                },
                {
                    token : keywordMapper,
                    regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                },
                {
                    token : "string",
                    regex : '"(?=.)',
                    next  : "qqstring"
                },
                {
                    token : "paren.lparen",
                    regex : "[[({]",
                    netx  : "start"
                },
                {
                    token : "paren.rparen",
                    regex : "[\\])}]"
                },
                {
                    token : "text",
                    regex : "\\s+"
                }
            ],
        "comment" : [
                {
                    token : "comment", 
                    regex : "\\*\\/", 
                    next : "start"},
                {
                    defaultToken : "comment"
                }
            ],
        "qqstring" : [
                {
                    token : "constant.language.escape",
                    regex : escapedRe
                }, {
                    token : "string",
                    regex : "\\\\$",
                    next  : "qqstring"
                }, 
                {
                    token : "string",
                    regex : '"|$',
                    next  : "start"
                },
                {
                    defaultToken: "string"
                }
            ]
    };
        
    }

    oop.inherits(AlfaHighlightRules, TextHighlightRules);

    exports.AlfaHighlightRules = AlfaHighlightRules;
});

define('ace/mode/matching_brace_outdent', ['require', 'exports', 'module' , 'ace/range'], function(require, exports, module) {

    var Range = require("../range").Range;

    var MatchingBraceOutdent = function() {};

    (function() {

        this.checkOutdent = function(line, input) {
            if (! /^\s+$/.test(line))
                return false;

            return /^\s*\}/.test(input);
        };

        this.autoOutdent = function(doc, row) {
            var line = doc.getLine(row);
            var match = line.match(/^(\s*\})/);

            if (!match) return 0;

            var column = match[1].length;
            var openBracePos = doc.findMatchingBracket({row: row, column: column});

            if (!openBracePos || openBracePos.row == row) return 0;

            var indent = this.$getIndent(doc.getLine(openBracePos.row));
            doc.replace(new Range(row, 0, row, column-1), indent);
        };

        this.$getIndent = function(line) {
            return line.match(/^\s*/)[0];
        };

    }).call(MatchingBraceOutdent.prototype);

    exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

define('ace/mode/behaviour/cstyle', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/behaviour', 'ace/token_iterator', 'ace/lib/lang'], function(require, exports, module) {


    var oop = require("../../lib/oop");
    var Behaviour = require("../behaviour").Behaviour;
    var TokenIterator = require("../../token_iterator").TokenIterator;
    var lang = require("../../lib/lang");

    var SAFE_INSERT_IN_TOKENS =
        ["text", "paren.rparen", "punctuation.operator"];
    var SAFE_INSERT_BEFORE_TOKENS =
        ["text", "paren.rparen", "punctuation.operator", "comment"];


    var autoInsertedBrackets = 0;
    var autoInsertedRow = -1;
    var autoInsertedLineEnd = "";
    var maybeInsertedBrackets = 0;
    var maybeInsertedRow = -1;
    var maybeInsertedLineStart = "";
    var maybeInsertedLineEnd = "";

    var CstyleBehaviour = function () {
        
        CstyleBehaviour.isSaneInsertion = function(editor, session) {
            var cursor = editor.getCursorPosition();
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            if (!this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS)) {
                var iterator2 = new TokenIterator(session, cursor.row, cursor.column + 1);
                if (!this.$matchTokenType(iterator2.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS))
                    return false;
            }
            iterator.stepForward();
            return iterator.getCurrentTokenRow() !== cursor.row ||
                this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_BEFORE_TOKENS);
        };
        
        CstyleBehaviour.$matchTokenType = function(token, types) {
            return types.indexOf(token.type || token) > -1;
        };
        
        CstyleBehaviour.recordAutoInsert = function(editor, session, bracket) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            if (!this.isAutoInsertedClosing(cursor, line, autoInsertedLineEnd[0]))
                autoInsertedBrackets = 0;
            autoInsertedRow = cursor.row;
            autoInsertedLineEnd = bracket + line.substr(cursor.column);
            autoInsertedBrackets++;
        };
        
        CstyleBehaviour.recordMaybeInsert = function(editor, session, bracket) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            if (!this.isMaybeInsertedClosing(cursor, line))
                maybeInsertedBrackets = 0;
            maybeInsertedRow = cursor.row;
            maybeInsertedLineStart = line.substr(0, cursor.column) + bracket;
            maybeInsertedLineEnd = line.substr(cursor.column);
            maybeInsertedBrackets++;
        };
        
        CstyleBehaviour.isAutoInsertedClosing = function(cursor, line, bracket) {
            return autoInsertedBrackets > 0 &&
                cursor.row === autoInsertedRow &&
                bracket === autoInsertedLineEnd[0] &&
                line.substr(cursor.column) === autoInsertedLineEnd;
        };
        
        CstyleBehaviour.isMaybeInsertedClosing = function(cursor, line) {
            return maybeInsertedBrackets > 0 &&
                cursor.row === maybeInsertedRow &&
                line.substr(cursor.column) === maybeInsertedLineEnd &&
                line.substr(0, cursor.column) == maybeInsertedLineStart;
        };
        
        CstyleBehaviour.popAutoInsertedClosing = function() {
            autoInsertedLineEnd = autoInsertedLineEnd.substr(1);
            autoInsertedBrackets--;
        };
        
        CstyleBehaviour.clearMaybeInsertedClosing = function() {
            maybeInsertedBrackets = 0;
            maybeInsertedRow = -1;
        };

        this.add("braces", "insertion", function (state, action, editor, session, text) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            if (text == '{') {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && selected !== "{" && editor.getWrapBehavioursEnabled()) {
                    return {
                        text: '{' + selected + '}',
                        selection: false
                    };
                } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                    if (/[\]\}\)]/.test(line[cursor.column])) {
                        CstyleBehaviour.recordAutoInsert(editor, session, "}");
                        return {
                            text: '{}',
                            selection: [1, 1]
                        };
                    } else {
                        CstyleBehaviour.recordMaybeInsert(editor, session, "{");
                        return {
                            text: '{',
                            selection: [1, 1]
                        };
                    }
                }
            } else if (text == '}') {
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == '}') {
                    var matching = session.$findOpeningBracket('}', {column: cursor.column + 1, row: cursor.row});
                    if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                        CstyleBehaviour.popAutoInsertedClosing();
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            } else if (text == "\n" || text == "\r\n") {
                var closing = "";
                if (CstyleBehaviour.isMaybeInsertedClosing(cursor, line)) {
                    closing = lang.stringRepeat("}", maybeInsertedBrackets);
                    CstyleBehaviour.clearMaybeInsertedClosing();
                }
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == '}' || closing !== "") {
                    var openBracePos = session.findMatchingBracket({row: cursor.row, column: cursor.column}, '}');
                    if (!openBracePos)
                         return null;

                    var indent = this.getNextLineIndent(state, line.substring(0, cursor.column), session.getTabString());
                    var next_indent = this.$getIndent(line);

                    return {
                        text: '\n' + indent + '\n' + next_indent + closing,
                        selection: [1, indent.length, 1, indent.length]
                    };
                }
            }
        });

        this.add("braces", "deletion", function (state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && selected == '{') {
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.end.column, range.end.column + 1);
                if (rightChar == '}') {
                    range.end.column++;
                    return range;
                } else {
                    maybeInsertedBrackets--;
                }
            }
        });

        this.add("parens", "insertion", function (state, action, editor, session, text) {
            if (text == '(') {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                    return {
                        text: '(' + selected + ')',
                        selection: false
                    };
                } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                    CstyleBehaviour.recordAutoInsert(editor, session, ")");
                    return {
                        text: '()',
                        selection: [1, 1]
                    };
                }
            } else if (text == ')') {
                var cursor = editor.getCursorPosition();
                var line = session.doc.getLine(cursor.row);
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == ')') {
                    var matching = session.$findOpeningBracket(')', {column: cursor.column + 1, row: cursor.row});
                    if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                        CstyleBehaviour.popAutoInsertedClosing();
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            }
        });

        this.add("parens", "deletion", function (state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && selected == '(') {
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
                if (rightChar == ')') {
                    range.end.column++;
                    return range;
                }
            }
        });

        this.add("brackets", "insertion", function (state, action, editor, session, text) {
            if (text == '[') {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                    return {
                        text: '[' + selected + ']',
                        selection: false
                    };
                } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                    CstyleBehaviour.recordAutoInsert(editor, session, "]");
                    return {
                        text: '[]',
                        selection: [1, 1]
                    };
                }
            } else if (text == ']') {
                var cursor = editor.getCursorPosition();
                var line = session.doc.getLine(cursor.row);
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == ']') {
                    var matching = session.$findOpeningBracket(']', {column: cursor.column + 1, row: cursor.row});
                    if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                        CstyleBehaviour.popAutoInsertedClosing();
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            }
        });

        this.add("brackets", "deletion", function (state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && selected == '[') {
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
                if (rightChar == ']') {
                    range.end.column++;
                    return range;
                }
            }
        });

        this.add("string_dquotes", "insertion", function (state, action, editor, session, text) {
            if (text == '"' || text == "'") {
                var quote = text;
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && selected !== "'" && selected != '"' && editor.getWrapBehavioursEnabled()) {
                    return {
                        text: quote + selected + quote,
                        selection: false
                    };
                } else {
                    var cursor = editor.getCursorPosition();
                    var line = session.doc.getLine(cursor.row);
                    var leftChar = line.substring(cursor.column-1, cursor.column);
                    if (leftChar == '\\') {
                        return null;
                    }
                    var tokens = session.getTokens(selection.start.row);
                    var col = 0, token;
                    var quotepos = -1; // Track whether we're inside an open quote.

                    for (var x = 0; x < tokens.length; x++) {
                        token = tokens[x];
                        if (token.type == "string") {
                          quotepos = -1;
                        } else if (quotepos < 0) {
                          quotepos = token.value.indexOf(quote);
                        }
                        if ((token.value.length + col) > selection.start.column) {
                            break;
                        }
                        col += tokens[x].value.length;
                    }
                    if (!token || (quotepos < 0 && token.type !== "comment" && (token.type !== "string" || ((selection.start.column !== token.value.length+col-1) && token.value.lastIndexOf(quote) === token.value.length-1)))) {
                        if (!CstyleBehaviour.isSaneInsertion(editor, session))
                            return;
                        return {
                            text: quote + quote,
                            selection: [1,1]
                        };
                    } else if (token && token.type === "string") {
                        var rightChar = line.substring(cursor.column, cursor.column + 1);
                        if (rightChar == quote) {
                            return {
                                text: '',
                                selection: [1, 1]
                            };
                        }
                    }
                }
            }
        });

        this.add("string_dquotes", "deletion", function (state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && (selected == '"' || selected == "'")) {
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
                if (rightChar == selected) {
                    range.end.column++;
                    return range;
                }
            }
        });

    };

    oop.inherits(CstyleBehaviour, Behaviour);

    exports.CstyleBehaviour = CstyleBehaviour;
});


define('ace/mode/folding/cstyle', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/range', 'ace/mode/folding/fold_mode'], function(require, exports, module) {

    var oop = require("../../lib/oop");
    var Range = require("../../range").Range;
    var BaseFoldMode = require("./fold_mode").FoldMode;

    var FoldMode = exports.FoldMode = function(commentRegex) {
        if (commentRegex) {
            this.foldingStartMarker = new RegExp(
                this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
            );
            this.foldingStopMarker = new RegExp(
                this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
            );
        }
    };
    oop.inherits(FoldMode, BaseFoldMode);

    (function() {

        this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
        this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;

        this.getFoldWidgetRange = function(session, foldStyle, row) {
            var line = session.getLine(row);
            var match = line.match(this.foldingStartMarker);
            if (match) {
                var i = match.index;

                if (match[1])
                    return this.openingBracketBlock(session, match[1], row, i);

                return session.getCommentFoldRange(row, i + match[0].length, 1);
            }

            if (foldStyle !== "markbeginend")
                return;

            var match = line.match(this.foldingStopMarker);
            if (match) {
                var i = match.index + match[0].length;

                if (match[1])
                    return this.closingBracketBlock(session, match[1], row, i);

                return session.getCommentFoldRange(row, i, -1);
            }
        };

    }).call(FoldMode.prototype);

});

// ace/snippets will be in main ace lib
// ['require', 'exports', 'module' , 'ace/lib/lang', 'ace/range', 'ace/keyboard/hash_handler', 'ace/tokenizer', 'ace/lib/dom'], 
define('ace/snippets', function(require, exports, module) {

    var lang = require("./lib/lang")
    var Range = require("./range").Range
    var HashHandler = require("./keyboard/hash_handler").HashHandler;
    var Tokenizer = require("./tokenizer").Tokenizer;
    var comparePoints = Range.comparePoints;

    var SnippetManager = function() {
        this.snippetMap = {};
        this.snippetNameMap = {};
    };

    (function() {
        this.getTokenizer = function() {
            function TabstopToken(str, _, stack) {
                str = str.substr(1);
                if (/^\d+$/.test(str) && !stack.inFormatString)
                    return [{tabstopId: parseInt(str, 10)}];
                return [{text: str}]
            }
            function escape(ch) {
                return "(?:[^\\\\" + ch + "]|\\\\.)";
            }
            SnippetManager.$tokenizer = new Tokenizer({
                start: [
                    {regex: /:/, onMatch: function(val, state, stack) {
                        if (stack.length && stack[0].expectIf) {
                            stack[0].expectIf = false;
                            stack[0].elseBranch = stack[0];
                            return [stack[0]];
                        }
                        return ":";
                    }},
                    {regex: /\\./, onMatch: function(val, state, stack) {
                        var ch = val[1];
                        if (ch == "}" && stack.length) {
                            val = ch;
                        }else if ("`$\\".indexOf(ch) != -1) {
                            val = ch;
                        } else if (stack.inFormatString) {
                            if (ch == "n")
                                val = "\n";
                            else if (ch == "t")
                                val = "\n";
                            else if ("ulULE".indexOf(ch) != -1) {
                                val = {changeCase: ch, local: ch > "a"};
                            }
                        }

                        return [val];
                    }},
                    {regex: /}/, onMatch: function(val, state, stack) {
                        return [stack.length ? stack.shift() : val];
                    }},
                    {regex: /\$(?:\d+|\w+)/, onMatch: TabstopToken},
                    {regex: /\$\{[\dA-Z_a-z]+/, onMatch: function(str, state, stack) {
                        var t = TabstopToken(str.substr(1), state, stack);
                        stack.unshift(t[0]);
                        return t;
                    }, next: "snippetVar"},
                    {regex: /\n/, token: "newline", merge: false}
                ],
                snippetVar: [
                    {regex: "\\|" + escape("\\|") + "*\\|", onMatch: function(val, state, stack) {
                        stack[0].choices = val.slice(1, -1).split(",");
                    }, next: "start"},
                    {regex: "/(" + escape("/") + "+)/(?:(" + escape("/") + "*)/)(\\w*):?",
                     onMatch: function(val, state, stack) {
                        var ts = stack[0];
                        ts.fmtString = val;

                        val = this.splitRegex.exec(val);
                        ts.guard = val[1];
                        ts.fmt = val[2];
                        ts.flag = val[3];
                        return "";
                    }, next: "start"},
                    {regex: "`" + escape("`") + "*`", onMatch: function(val, state, stack) {
                        stack[0].code = val.splice(1, -1);
                        return "";
                    }, next: "start"},
                    {regex: "\\?", onMatch: function(val, state, stack) {
                        if (stack[0])
                            stack[0].expectIf = true;
                    }, next: "start"},
                    {regex: "([^:}\\\\]|\\\\.)*:?", token: "", next: "start"}
                ],
                formatString: [
                    {regex: "/(" + escape("/") + "+)/", token: "regex"},
                    {regex: "", onMatch: function(val, state, stack) {
                        stack.inFormatString = true;
                    }, next: "start"}
                ]
            });
            SnippetManager.prototype.getTokenizer = function() {
                return SnippetManager.$tokenizer;
            }
            return SnippetManager.$tokenizer;
        };

        this.tokenizeTmSnippet = function(str, startState) {
            return this.getTokenizer().getLineTokens(str, startState).tokens.map(function(x) {
                return x.value || x;
            });
        };

        this.$getDefaultValue = function(editor, name) {
            if (/^[A-Z]\d+$/.test(name)) {
                var i = name.substr(1);
                return (this.variables[name[0] + "__"] || {})[i];
            }
            if (/^\d+$/.test(name)) {
                return (this.variables.__ || {})[name];
            }
            name = name.replace(/^TM_/, "");

            if (!editor)
                return;
            var s = editor.session;
            switch(name) {
                case "CURRENT_WORD":
                    var r = s.getWordRange();
                case "SELECTION":
                case "SELECTED_TEXT":
                    return s.getTextRange(r);
                case "CURRENT_LINE":
                    return s.getLine(e.getCursorPosition().row);
                case "LINE_INDEX":
                    return e.getCursorPosition().column;
                case "LINE_NUMBER":
                    return e.getCursorPosition().row + 1;
                case "SOFT_TABS":
                    return s.getUseSoftTabs() ? "YES" : "NO";
                case "TAB_SIZE":
                    return s.getTabSize();
                case "FILENAME":
                case "FILEPATH":
                    return "ace.ajax.org";
                case "FULLNAME":
                    return "Ace";
            }
        };
        this.variables = {};
        this.getVariableValue = function(editor, varName) {
            if (this.variables.hasOwnProperty(varName))
                return this.variables[varName](editor, varName) || "";
            return this.$getDefaultValue(editor, varName) || "";
        };
        this.tmStrFormat = function(str, ch, editor) {
            var flag = ch.flag || "";
            var re = ch.guard;
            re = new RegExp(re, flag.replace(/[^gi]/, ""));
            var fmtTokens = this.tokenizeTmSnippet(ch.fmt, "formatString");
            var _self = this;
            var formatted = str.replace(re, function() {
                _self.variables.__ = arguments;
                var fmtParts = _self.resolveVariables(fmtTokens, editor);
                var gChangeCase = "E";
                for (var i  = 0; i < fmtParts.length; i++) {
                    var ch = fmtParts[i];
                    if (typeof ch == "object") {
                        fmtParts[i] = "";
                        if (ch.changeCase && ch.local) {
                            var next = fmtParts[i + 1];
                            if (next && typeof next == "string") {
                                if (ch.changeCase == "u")
                                    fmtParts[i] = next[0].toUpperCase();
                                else
                                    fmtParts[i] = next[0].toLowerCase();
                                fmtParts[i + 1] = next.substr(1);
                            }
                        } else if (ch.changeCase) {
                            gChangeCase = ch.changeCase;
                        }
                    } else if (gChangeCase == "U") {
                        fmtParts[i] = ch.toUpperCase();
                    } else if (gChangeCase == "L") {
                        fmtParts[i] = ch.toLowerCase();
                    }
                }
                return fmtParts.join("");
            });
            this.variables.__ = null;
            return formatted;
        };

        this.resolveVariables = function(snippet, editor) {
            var result = [];
            for (var i = 0; i < snippet.length; i++) {
                var ch = snippet[i];
                if (typeof ch == "string") {
                    result.push(ch);
                } else if (typeof ch != "object") {
                    continue;
                } else if (ch.skip) {
                    gotoNext(ch);
                } else if (ch.processed < i) {
                    continue;
                } else if (ch.text) {
                    var value = this.getVariableValue(editor, ch.text);
                    if (value && ch.fmtString)
                        value = this.tmStrFormat(value, ch);
                    ch.processed = i;
                    if (ch.expectIf == null) {
                        if (value) {
                            result.push(value);
                            gotoNext(ch);
                        }
                    } else {
                        if (value) {
                            ch.skip = ch.elseBranch;
                        } else
                            gotoNext(ch);
                    }
                } else if (ch.tabstopId != null) {
                    result.push(ch);
                } else if (ch.changeCase != null) {
                    result.push(ch);
                }
            }
            function gotoNext(ch) {
                var i1 = snippet.indexOf(ch, i + 1);
                if (i1 != -1)
                    i = i1;
            }
            return result;
        };

        this.insertSnippet = function(editor, snippetText) {
            var cursor = editor.getCursorPosition();
            var line = editor.session.getLine(cursor.row);
            var indentString = line.match(/^\s*/)[0];
            var tabString = editor.session.getTabString();

            var tokens = this.tokenizeTmSnippet(snippetText);
            tokens = this.resolveVariables(tokens, editor);
            tokens = tokens.map(function(x) {
                if (x == "\n")
                    return x + indentString;
                if (typeof x == "string")
                    return x.replace(/\t/g, tabString);
                return x;
            });
            var tabstops = [];
            tokens.forEach(function(p, i) {
                if (typeof p != "object")
                    return;
                var id = p.tabstopId;
                if (!tabstops[id]) {
                    tabstops[id] = [];
                    tabstops[id].index = id;
                    tabstops[id].value = "";
                }
                if (tabstops[id].indexOf(p) != -1)
                    return;
                tabstops[id].push(p);
                var i1 = tokens.indexOf(p, i + 1);
                if (i1 == -1)
                    return;
                var value = tokens.slice(i + 1, i1).join("");
                if (value)
                    tabstops[id].value = value;
            });

            tabstops.forEach(function(ts) {
                ts.value && ts.forEach(function(p) {
                    var i = tokens.indexOf(p);
                    var i1 = tokens.indexOf(p, i + 1);
                    if (i1 == -1)
                        tokens.splice(i + 1, 0, ts.value, p);
                    else if (i1 == i + 1)
                        tokens.splice(i + 1, 0, ts.value);
                });
            });
            var row = 0, column = 0;
            var text = "";
            tokens.forEach(function(t) {
                if (typeof t == "string") {
                    if (t[0] == "\n"){
                        column = t.length - 1;
                        row ++;
                    } else
                        column += t.length;
                    text += t;
                } else {
                    if (!t.start)
                        t.start = {row: row, column: column};
                    else
                        t.end = {row: row, column: column};
                }
            });
            var range = editor.getSelectionRange();
            var end = editor.session.replace(range, text);

            var tabstopManager = new TabstopManager(editor);
            tabstopManager.addTabstops(tabstops, range.start, end);
            tabstopManager.tabNext();
        };

        this.$getScope = function(editor) {
            var scope = editor.session.$mode.$id || "";
            scope = scope.split("/").pop();
            if (editor.session.$mode.$modes) {
                var c = editor.getCursorPosition()
                var state = editor.session.getState(c.row);
                if (state.substring) {
                    if (state.substring(0, 3) == "js-")
                        scope = "javascript";
                    else if (state.substring(0, 4) == "css-")
                        scope = "css";
                    else if (state.substring(0, 4) == "alfa-")
                        scope = "alfa";
                    else if (state.substring(0, 4) == "php-")
                        scope = "php";
                }
            }
            return scope;
        };

        this.expandWithTab = function(editor) {
            var cursor = editor.getCursorPosition();
            var line = editor.session.getLine(cursor.row);
            var before = line.substring(0, cursor.column);
            var after = line.substr(cursor.column);

            var scope = this.$getScope(editor);
            var snippetMap = this.snippetMap;
            var snippet;
            [scope, "_"].some(function(scope) {
                var snippets = snippetMap[scope];
                if (snippets)
                    snippet = this.findMatchingSnippet(snippets, before, after);
                return !!snippet;
            }, this);
            if (!snippet)
                return false;

            editor.session.doc.removeInLine(cursor.row,
                cursor.column - snippet.replaceBefore.length,
                cursor.column + snippet.replaceAfter.length
            );

            this.variables.M__ = snippet.matchBefore;
            this.variables.T__ = snippet.matchAfter;
            this.insertSnippet(editor, snippet.content);

            this.variables.M__ = this.variables.T__ = null;
            return true;
        };

        this.findMatchingSnippet = function(snippetList, before, after) {
            for (var i = snippetList.length; i--;) {
                var s = snippetList[i];
                if (s.startRe && !s.startRe.test(before))
                    continue;
                if (s.endRe && !s.endRe.test(after))
                    continue;
                if (!s.startRe && !s.endRe)
                    continue;

                s.matchBefore = s.startRe ? s.startRe.exec(before) : [""];
                s.matchAfter = s.endRe ? s.endRe.exec(after) : [""];
                s.replaceBefore = s.triggerRe ? s.triggerRe.exec(before)[0] : "";
                s.replaceAfter = s.endTriggerRe ? s.endTriggerRe.exec(after)[0] : "";
                return s;
            }
        };

        this.snippetMap = {};
        this.snippetNameMap = {};
        this.register = function(snippets, scope) {
            var snippetMap = this.snippetMap;
            var snippetNameMap = this.snippetNameMap;
            var self = this;
            function wrapRegexp(src) {
                if (src && !/^\^?\(.*\)\$?$|^\\b$/.test(src))
                    src = "(?:" + src + ")"

                return src || "";
            }
            function guardedRegexp(re, guard, opening) {
                re = wrapRegexp(re);
                guard = wrapRegexp(guard);
                if (opening) {
                    re = guard + re;
                    if (re && re[re.length - 1] != "$")
                        re = re + "$";
                } else {
                    re = re + guard;
                    if (re && re[0] != "^")
                        re = "^" + re;
                }
                return new RegExp(re);
            }

            function addSnippet(s) {
                if (!s.scope)
                    s.scope = scope || "_";
                scope = s.scope
                if (!snippetMap[scope]) {
                    snippetMap[scope] = [];
                    snippetNameMap[scope] = {};
                }

                var map = snippetNameMap[scope];
                if (s.name) {
                    var old = map[s.name];
                    if (old)
                        self.unregister(old);
                    map[s.name] = s;
                }
                snippetMap[scope].push(s);

                if (s.tabTrigger && !s.trigger) {
                    if (!s.guard && /^\w/.test(s.tabTrigger))
                        s.guard = "\\b";
                    s.trigger = lang.escapeRegExp(s.tabTrigger);
                }

                s.startRe = guardedRegexp(s.trigger, s.guard, true);
                s.triggerRe = new RegExp(s.trigger, "", true);

                s.endRe = guardedRegexp(s.endTrigger, s.endGuard, true);
                s.endTriggerRe = new RegExp(s.endTrigger, "", true);
            };

            if (snippets.content)
                addSnippet(snippets);
            else if (Array.isArray(snippets))
                snippets.forEach(addSnippet);
        };
        this.unregister = function(snippets, scope) {
            var snippetMap = this.snippetMap;
            var snippetNameMap = this.snippetNameMap;

            function removeSnippet(s) {
                var map = snippetNameMap[scope];
                if (map && map[s.name]) {
                    delete map[s.name];
                    map = snippetMap[scope];
                    var i = map && map.indexOf(s);
                    if (i >= 0)
                        map.splice(i, 1);
                }
            }
            if (snippets.content)
                removeSnippet(snippets);
            else if (Array.isArray(snippets))
                snippets.forEach(removeSnippet);
        };
        this.parseSnippetFile = function(str) {
            str = str.replace(/\r/, "");
            var list = [], snippet = {};
            var re = /^#.*|^({[\s\S]*})\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm;
            var m;
            while (m = re.exec(str)) {
                if (m[1]) {
                    try {
                        snippet = JSON.parse(m[1])
                        list.push(snippet);
                    } catch (e) {}
                } if (m[4]) {
                    snippet.content = m[4].replace(/^\t/gm, "");
                    list.push(snippet);
                    snippet = {};
                } else {
                    var key = m[2], val = m[3];
                    if (key == "regex") {
                        var guardRe = /\/((?:[^\/\\]|\\.)*)|$/g;
                        snippet.guard = guardRe.exec(val)[1];
                        snippet.trigger = guardRe.exec(val)[1];
                        snippet.endTrigger = guardRe.exec(val)[1];
                        snippet.endGuard = guardRe.exec(val)[1];
                    } else if (key == "snippet") {
                        snippet.tabTrigger = val.match(/^\S*/)[0];
                        if (!snippet.name)
                            snippet.name = val;
                    } else {
                        snippet[key] = val;
                    }
                }
            }
            return list;
        };
        this.getSnippetByName = function(name, editor) {
            var scope = editor && this.$getScope(editor);
            var snippetMap = this.snippetNameMap;
            var snippet;
            [scope, "_"].some(function(scope) {
                var snippets = snippetMap[scope];
                if (snippets)
                    snippet = snippets[name];
                return !!snippet;
            }, this);
            return snippet;
        };

    }).call(SnippetManager.prototype);



    var TabstopManager = function(editor) {
        if (editor.tabstopManager)
            return editor.tabstopManager;
        editor.tabstopManager = this;
        this.$onChange = this.onChange.bind(this);
        this.$onChangeSelection = lang.delayedCall(this.onChangeSelection.bind(this)).schedule;
        this.$onChangeSession = this.onChangeSession.bind(this);
        this.$onAfterExec = this.onAfterExec.bind(this);
        this.attach(editor);
    };
    (function() {
        this.attach = function(editor) {
            this.index = -1;
            this.ranges = [];
            this.tabstops = [];
            this.selectedTabstop = null;

            this.editor = editor;
            this.editor.on("change", this.$onChange);
            this.editor.on("changeSelection", this.$onChangeSelection);
            this.editor.on("changeSession", this.$onChangeSession);
            this.editor.commands.on("afterExec", this.$onAfterExec);
            this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
        };
        this.detach = function() {
            this.tabstops.forEach(this.removeTabstopMarkers, this);
            this.ranges = null;
            this.tabstops = null;
            this.selectedTabstop = null;
            this.editor.removeListener("change", this.$onChange);
            this.editor.removeListener("changeSelection", this.$onChangeSelection);
            this.editor.removeListener("changeSession", this.$onChangeSession);
            this.editor.commands.removeListener("afterExec", this.$onAfterExec);
            this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
            this.editor.tabstopManager = null;
            this.editor = null;
        };

        this.onChange = function(e) {
            var changeRange = e.data.range;
            var isRemove = e.data.action[0] == "r";
            var start = changeRange.start;
            var end = changeRange.end;
            var startRow = start.row;
            var endRow = end.row;
            var lineDif = endRow - startRow;
            var colDiff = end.column - start.column;

            if (isRemove) {
                lineDif = -lineDif;
                colDiff = -colDiff;
            }
            if (!this.$inChange && isRemove) {
                var ts = this.selectedTabstop;
                var changedOutside = !ts.some(function(r) {
                    return comparePoints(r.start, start) <= 0 && comparePoints(r.end, end) >= 0;
                });
                if (changedOutside)
                    return this.detach();
            }
            var ranges = this.ranges;
            for (var i = 0; i < ranges.length; i++) {
                var r = ranges[i];
                if (r.end.row < start.row)
                    continue;

                if (comparePoints(start, r.start) < 0 && comparePoints(end, r.end) > 0) {
                    this.removeRange(r);
                    i--;
                    continue;
                }

                if (r.start.row == startRow && r.start.column > start.column)
                    r.start.column += colDiff;
                if (r.end.row == startRow && r.end.column >= start.column)
                    r.end.column += colDiff;
                if (r.start.row >= startRow)
                    r.start.row += lineDif;
                if (r.end.row >= startRow)
                    r.end.row += lineDif;

                if (comparePoints(r.start, r.end) > 0)
                    this.removeRange(r);
            }
            if (!ranges.length)
                this.detach();
        };
        this.updateLinkedFields = function() {
            var ts = this.selectedTabstop;
            if (!ts.hasLinkedRanges)
                return;
            this.$inChange = true;
            var session = this.editor.session;
            var text = session.getTextRange(ts.firstNonLinked);
            for (var i = ts.length; i--;) {
                var range = ts[i];
                if (!range.linked)
                    continue;
                var fmt = exports.snippetManager.tmStrFormat(text, range.original)
                session.replace(range, fmt);
            }
            this.$inChange = false;
        };
        this.onAfterExec = function(e) {
            if (e.command && !e.command.readOnly)
                this.updateLinkedFields();
        };
        this.onChangeSelection = function() {
            if (!this.editor)
                return
            var lead = this.editor.selection.lead;
            var anchor = this.editor.selection.anchor;
            var isEmpty = this.editor.selection.isEmpty();
            for (var i = this.ranges.length; i--;) {
                if (this.ranges[i].linked)
                    continue;
                var containsLead = this.ranges[i].contains(lead.row, lead.column);
                var containsAnchor = isEmpty || this.ranges[i].contains(anchor.row, anchor.column);
                if (containsLead && containsAnchor)
                    return;
            }
            this.detach();
        };
        this.onChangeSession = function() {
            this.detach();
        };
        this.tabNext = function(dir) {
            var max = this.tabstops.length - 1;
            var index = this.index + (dir || 1);
            index = Math.min(Math.max(index, 0), max);
            this.selectTabstop(index);
            if (index == max)
                this.detach();
        };
        this.selectTabstop = function(index) {
            var ts = this.tabstops[this.index];
            if (ts)
                this.addTabstopMarkers(ts);
            this.index = index;
            ts = this.tabstops[this.index];
            if (!ts || !ts.length)
                return;

            this.selectedTabstop = ts;
            var sel = this.editor.multiSelect;
            sel.toSingleRange(ts.firstNonLinked.clone());
            for (var i = ts.length; i--;) {
                if (ts.hasLinkedRanges && ts[i].linked)
                    continue;
                sel.addRange(ts[i].clone(), true);
            }
            this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
        };
        this.addTabstops = function(tabstops, start, end) {
            if (!tabstops[0]) {
                var p = Range.fromPoints(end, end);
                moveRelative(p.start, start);
                moveRelative(p.end, start);
                tabstops[0] = [p];
                tabstops[0].index = 0;
            }

            var i = this.index;
            var arg = [i, 0];
            var ranges = this.ranges;
            var editor = this.editor;
            tabstops.forEach(function(ts) {
                for (var i = ts.length; i--;) {
                    var p = ts[i];
                    var range = Range.fromPoints(p.start, p.end || p.start);
                    movePoint(range.start, start);
                    movePoint(range.end, start);
                    range.original = p;
                    range.tabstop = ts;
                    ranges.push(range);
                    ts[i] = range;
                    if (p.fmtString) {
                        range.linked = true;
                        ts.hasLinkedRanges = true;
                    } else if (!ts.firstNonLinked)
                        ts.firstNonLinked = range;
                }
                if (!ts.firstNonLinked)
                    ts.hasLinkedRanges = false;
                arg.push(ts);
                this.addTabstopMarkers(ts);
            }, this);
            arg.push(arg.splice(2, 1)[0]);
            this.tabstops.splice.apply(this.tabstops, arg);
        };

        this.addTabstopMarkers = function(ts) {
            var session = this.editor.session;
            ts.forEach(function(range) {
                if  (!range.markerId)
                    range.markerId = session.addMarker(range, "ace_snippet-marker", "text");
            });
        };
        this.removeTabstopMarkers = function(ts) {
            var session = this.editor.session;
            ts.forEach(function(range) {
                session.removeMarker(range.markerId);
                range.markerId = null;
            });
        };
        this.removeRange = function(range) {
            var i = range.tabstop.indexOf(range);
            range.tabstop.splice(i, 1);
            i = this.ranges.indexOf(range);
            this.ranges.splice(i, 1);
            this.editor.session.removeMarker(range.markerId);
        };

        this.keyboardHandler = new HashHandler();
        this.keyboardHandler.bindKeys({
            "Tab": function(ed) {
                ed.tabstopManager.tabNext(1);
            },
            "Shift-Tab": function(ed) {
                ed.tabstopManager.tabNext(-1);
            },
            "Esc": function(ed) {
                ed.tabstopManager.detach();
            },
            "!Return": function(ed) {
                return false;
            }
        });
    }).call(TabstopManager.prototype);


    var movePoint = function(point, diff) {
        if (point.row == 0)
            point.column += diff.column;
        point.row += diff.row;
    };

    var moveRelative = function(point, start) {
        if (point.row == start.row)
            point.column -= start.column;
        point.row -= start.row;
    };


    require("./lib/dom").importCssString("\
    .ace_snippet-marker {\
        -moz-box-sizing: border-box;\
        box-sizing: border-box;\
        background: rgba(194, 193, 208, 0.09);\
        border: 1px dotted rgba(211, 208, 235, 0.62);\
        position: absolute;\
    }");

    exports.snippetManager = new SnippetManager();


});

define('ace/snippets/alfa', function(require, exports, module) {    
    exports.snippetText = "\n\
snippet attr\n\
\tattribute ${1:attribute_name} {\n\
\t\tid = \"${2:id}\"\n\
\t\ttype = ${3:type}\n\
\t\tcategory = ${4:category}\n\
\t}\
";
});