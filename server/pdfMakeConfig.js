//**file to set a pdf config like header and footer */
const path = require('path');
const { toFlipText } = require('./services/generalServices');

const docHeader = () =>
    [
        {
            image: path.join(__dirname, '.', 'public', 'LoghatyLogo.jpg'), // Logo image (adjust the path as needed)
            width: 80, // Adjust the width as needed
            alignment: 'center', // Center the image
        }
    ]

const docFooter = (req) => (currentPage, pageCount) => {
    return [
        { canvas: [{ type: 'line', x1: 40, y1: 10, x2: 550, y2: 10, lineWidth: 1 }] }, // Horizontal line
        {
            margin: [0, 10],
            columns: [
                { width: '*', text: '' },

                {
                    width: '*',
                    text: toFlipText(req.t('rightsReserved', { year: new Date().getFullYear() })),
                    alignment: 'center', // Center the text horizontally
                },

                {
                    width: '*',
                    text: toFlipText(req.t('pageOf', { current: currentPage, total: pageCount })),
                    alignment: 'right', // Align the page number to the right
                    margin: [0, 0, 15, 0]
                },

            ],
        },
    ];
} 

const styles = {
    header: {
        fontSize: 18,
        bold: true,
        margin: 50
    }
}

const defaultStyle = (req) => ({
    font: 'Arial', // Default font for the document
    alignment: req.language !== 'en' ? 'right' : 'left'
})

// const createTable = () => 

const pageMargin = [10, 100, 10, 40];

module.exports = {
    docHeader,
    docFooter,
    pageMargin,
    styles,
    defaultStyle
}