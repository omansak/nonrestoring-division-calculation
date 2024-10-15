# Non-Restoring Division Calculation
The division operation is carried away by assuming fractional numbers. The Non-Restoring division algorithm is shown below. Initially R is set equal to N and n is the data width. The operands are in two’s compliment form where MSB bit is the signed bit. In Non-Restoring divider, quotient take the digit set {-1,1}. At the output, a conversion is needed to get the actual output.

### Application
https://omansak.github.io/nonrestoring-division-calculation/

### Commands 
- Install packages : `npm install`
- Run : `npm run serve`
- Deploy GH Pages : `npm run deploy`

<section>
    <h3>Implementation Code (Javascript)</h3>
    <ul>
        <li><a href="https://github.com/omansak/nonrestoring-division-calculation/blob/4fdcdcd9d29ec83a75e79454f65d6bef64cd721d/public/app.js#L49" target="_blank">2's Complement</a></li>
        <li><a href="https://github.com/omansak/nonrestoring-division-calculation/blob/4fdcdcd9d29ec83a75e79454f65d6bef64cd721d/public/app.js#L82" target="_blank">Two Binary Addition</a></li>
        <li><a href="https://github.com/omansak/nonrestoring-division-calculation/blob/4fdcdcd9d29ec83a75e79454f65d6bef64cd721d/public/app.js#L127" target="_blank">Convert Decimal To Binary</a></li>
        <li><a href="https://github.com/omansak/nonrestoring-division-calculation/blob/4fdcdcd9d29ec83a75e79454f65d6bef64cd721d/public/app.js#L146" target="_blank">Convert Binary To Decimal</a></li>
        <li><a href="https://github.com/omansak/nonrestoring-division-calculation/blob/4fdcdcd9d29ec83a75e79454f65d6bef64cd721d/public/app.js#L175" target="_blank">Shift Binary</a></li>
        <li><a href="https://github.com/omansak/nonrestoring-division-calculation/blob/4fdcdcd9d29ec83a75e79454f65d6bef64cd721d/public/app.js#L266" target="_blank">Algorithm A</a></li>
        <li><a href="https://github.com/omansak/nonrestoring-division-calculation/blob/4fdcdcd9d29ec83a75e79454f65d6bef64cd721d/public/app.js#L365" target="_blank">Algorithm B</a></li>
    </ul>
</section>

<section>
    <h3>Credits</h3>
    <ul>
        <li><a href="https://github.com/omansak" target="_blank">Osman Şakir 'OMANSAK' Kapar</a></li>
        <li><a href="email:omansakosk@gmail.com" target="_blank">Email</a></li>
        <li><a href="https://omansak.blogspot.com" target="_blank">Blog</a></li>
        <li><a href="https://bilgisayarmuhendislik.iuc.edu.tr/en/_" target="_blank">Istanbul University-Cerrahpasa</a></li>
    </ul>
</section>