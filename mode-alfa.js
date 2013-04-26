define('ace/mode/alfa', function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var Tokenizer = require("ace/tokenizer").Tokenizer;
    var AlfaHighlightRules = require("ace/mode/alfa_highlight_rules").AlfaHighlightRules;
    var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
    var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
    var CStyleFoldMode = require("./folding/cstyle").FoldMode;

    var Mode = function() {
        this.$tokenizer = new Tokenizer(new AlfaHighlightRules().getRules());
        this.$outdent = new MatchingBraceOutdent();
        this.$behaviour = new CstyleBehaviour();
        this.foldingRules = new CStyleFoldMode();

    };
    oop.inherits(Mode, TextMode);

    (function() {
        
        this.lineCommentStart = "//";
        this.blockComment = {start: "/*", end: "*/"};

        this.getNextLineIndent = function(state, line, tab) {
            console.log("getNextLineIndent")
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
                    token : keywordMapper,
                    regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token : "keyword.operator",
                    regex : "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in)|and|or"
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